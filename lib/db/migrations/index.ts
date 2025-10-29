import { DatabaseError, dbConnection } from '../connection';

/**
 * Migration interface that all migrations must implement
 */
export interface Migration {
  version: number;
  name: string;
  description: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

/**
 * Migration runner for managing database schema changes
 * Uses SQLite user_version pragma to track applied migrations
 */
export class MigrationRunner {
  private migrations: Migration[] = [];

  /**
   * Register a migration
   */
  public register(migration: Migration): void {
    this.migrations.push(migration);
    // Sort migrations by version number
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get all registered migrations
   */
  public getMigrations(): Migration[] {
    return [...this.migrations];
  }

  /**
   * Get the latest migration version
   */
  public getLatestVersion(): number {
    if (this.migrations.length === 0) {
      return 0;
    }
    return this.migrations[this.migrations.length - 1].version;
  }

  /**
   * Get pending migrations (not yet applied)
   */
  public async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return this.migrations.filter(
      (migration) => migration.version > currentVersion
    );
  }

  /**
   * Get the current database version
   */
  public async getCurrentVersion(): Promise<number> {
    try {
      return await dbConnection.getUserVersion();
    } catch (error) {
      console.error('Failed to get current database version:', error);
      throw new DatabaseError(
        'VERSION_CHECK_FAILED',
        'Failed to get current database version',
        error
      );
    }
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(): Promise<void> {
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      return;
    }

    console.log(
      `Running ${pendingMigrations.length} pending migrations...`
    );

    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }

    console.log('All migrations completed successfully');
  }

  /**
   * Run a single migration
   */
  public async runMigration(migration: Migration): Promise<void> {
    console.log(
      `Running migration ${migration.version}: ${migration.name}`
    );

    try {
      await dbConnection.executeTransaction(async (db) => {
        // Run the migration
        await migration.up();

        // Update the user version
        await dbConnection.setUserVersion(migration.version);
      });

      console.log(
        `Migration ${migration.version} completed successfully`
      );
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw new DatabaseError(
        'MIGRATION_FAILED',
        `Migration ${migration.version} (${migration.name}) failed`,
        error
      );
    }
  }

  /**
   * Rollback to a specific version
   */
  public async rollbackToVersion(
    targetVersion: number
  ): Promise<void> {
    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      console.log(
        `Already at version ${currentVersion}, no rollback needed`
      );
      return;
    }

    // Get migrations to rollback (in reverse order)
    const migrationsToRollback = this.migrations
      .filter(
        (migration) =>
          migration.version > targetVersion &&
          migration.version <= currentVersion
      )
      .sort((a, b) => b.version - a.version);

    console.log(
      `Rolling back ${migrationsToRollback.length} migrations to version ${targetVersion}...`
    );

    for (const migration of migrationsToRollback) {
      await this.rollbackMigration(migration);
    }

    console.log(
      `Rollback to version ${targetVersion} completed successfully`
    );
  }

  /**
   * Rollback a single migration
   */
  public async rollbackMigration(
    migration: Migration
  ): Promise<void> {
    console.log(
      `Rolling back migration ${migration.version}: ${migration.name}`
    );

    try {
      await dbConnection.executeTransaction(async (db) => {
        // Run the rollback
        await migration.down();

        // Update the user version to the previous migration version
        const previousVersion =
          this.migrations
            .filter((m) => m.version < migration.version)
            .sort((a, b) => b.version - a.version)[0]?.version || 0;

        await dbConnection.setUserVersion(previousVersion);
      });

      console.log(
        `Migration ${migration.version} rolled back successfully`
      );
    } catch (error) {
      console.error(
        `Rollback of migration ${migration.version} failed:`,
        error
      );
      throw new DatabaseError(
        'ROLLBACK_FAILED',
        `Rollback of migration ${migration.version} (${migration.name}) failed`,
        error
      );
    }
  }

  /**
   * Check if database is at the latest version
   */
  public async isUpToDate(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.getLatestVersion();
    return currentVersion >= latestVersion;
  }

  /**
   * Get migration status information
   */
  public async getStatus(): Promise<{
    currentVersion: number;
    latestVersion: number;
    pendingCount: number;
    isUpToDate: boolean;
    migrations: {
      version: number;
      name: string;
      description: string;
      applied: boolean;
    }[];
  }> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.getLatestVersion();
    const pendingMigrations = await this.getPendingMigrations();

    const migrations = this.migrations.map((migration) => ({
      version: migration.version,
      name: migration.name,
      description: migration.description,
      applied: migration.version <= currentVersion,
    }));

    return {
      currentVersion,
      latestVersion,
      pendingCount: pendingMigrations.length,
      isUpToDate: currentVersion >= latestVersion,
      migrations,
    };
  }

  /**
   * Reset database to version 0 (drop all tables)
   */
  public async reset(): Promise<void> {
    console.log('Resetting database to version 0...');

    // Run all migrations in reverse order to clean up
    const migrationsToRollback = [...this.migrations].sort(
      (a, b) => b.version - a.version
    );

    for (const migration of migrationsToRollback) {
      try {
        await migration.down();
      } catch (error) {
        console.warn(
          `Warning: Failed to rollback migration ${migration.version}:`,
          error
        );
      }
    }

    // Set version to 0
    await dbConnection.setUserVersion(0);

    console.log('Database reset completed');
  }
}

// Create singleton instance
export const migrationRunner = new MigrationRunner();

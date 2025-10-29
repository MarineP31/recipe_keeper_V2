import * as SQLite from 'expo-sqlite';

/**
 * Database connection manager for SQLite operations
 * Implements singleton pattern to ensure single connection instance
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize database connection
   * Creates database file if it doesn't exist
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Open database connection
      this.db = await SQLite.openDatabaseAsync('recipe_keeper.db');

      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      // Set journal mode to WAL for better performance
      await this.db.execAsync('PRAGMA journal_mode = WAL;');

      // Set synchronous mode to NORMAL for better performance
      await this.db.execAsync('PRAGMA synchronous = NORMAL;');

      this.isInitialized = true;
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error(
        'Failed to initialize database connection:',
        error
      );
      throw new DatabaseError(
        'CONNECTION_FAILED',
        'Failed to initialize database connection',
        error
      );
    }
  }

  /**
   * Get database instance
   * Throws error if not initialized
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.isInitialized) {
      throw new DatabaseError(
        'NOT_INITIALIZED',
        'Database not initialized. Call initialize() first.'
      );
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  public async executeTransaction<T>(
    operation: (db: SQLite.SQLiteDatabase) => Promise<T>
  ): Promise<T> {
    const db = this.getDatabase();

    try {
      await db.execAsync('BEGIN TRANSACTION;');
      const result = await operation(db);
      await db.execAsync('COMMIT;');
      return result;
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      console.error('Transaction failed, rolled back:', error);
      throw error;
    }
  }

  /**
   * Execute a query with error handling
   */
  public async executeQuery(
    query: string,
    params: any[] = []
  ): Promise<SQLite.SQLiteRunResult> {
    const db = this.getDatabase();

    try {
      return await db.runAsync(query, params);
    } catch (error) {
      console.error('Query execution failed:', {
        query,
        params,
        error,
      });
      throw new DatabaseError(
        'QUERY_FAILED',
        'Query execution failed',
        error
      );
    }
  }

  /**
   * Execute a select query and return results
   */
  public async executeSelect<T>(
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    const db = this.getDatabase();

    try {
      return await db.getAllAsync<T>(query, params);
    } catch (error) {
      console.error('Select query failed:', { query, params, error });
      throw new DatabaseError(
        'SELECT_FAILED',
        'Select query failed',
        error
      );
    }
  }

  /**
   * Get the current user version (migration tracking)
   */
  public async getUserVersion(): Promise<number> {
    const db = this.getDatabase();
    try {
      const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version;'
      );
      return result?.user_version || 0;
    } catch (error) {
      console.error('Failed to get user version:', error);
      throw new DatabaseError(
        'VERSION_CHECK_FAILED',
        'Failed to get user version',
        error
      );
    }
  }

  /**
   * Set the user version (migration tracking)
   */
  public async setUserVersion(version: number): Promise<void> {
    const db = this.getDatabase();
    try {
      await db.execAsync(`PRAGMA user_version = ${version};`);
    } catch (error) {
      console.error('Failed to set user version:', error);
      throw new DatabaseError(
        'VERSION_SET_FAILED',
        'Failed to set user version',
        error
      );
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
        this.db = null;
        this.isInitialized = false;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Failed to close database connection:', error);
        throw new DatabaseError(
          'CLOSE_FAILED',
          'Failed to close database connection',
          error
        );
      }
    }
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isReady()) {
        return false;
      }

      const db = this.getDatabase();
      await db.getFirstAsync('SELECT 1;');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

/**
 * Custom database error class with specific error codes
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Export singleton instance
export const dbConnection = DatabaseConnection.getInstance();

// Export types
export type { SQLite };

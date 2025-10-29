import { dbConnection } from '../connection';

/**
 * Add performance indexes migration
 * Creates indexes for common query patterns
 */
export const up = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Indexes for meal_plans table
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_meal_plans_date_meal_type
    ON meal_plans(date, mealType);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id
    ON meal_plans(recipeId);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_meal_plans_date
    ON meal_plans(date);
  `);

  // Indexes for shopping_list_items table
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_checked
    ON shopping_list_items(checked);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_recipe_id
    ON shopping_list_items(recipeId);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_meal_plan_id
    ON shopping_list_items(mealPlanId);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_name
    ON shopping_list_items(name);
  `);

  // Indexes for recipes table
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_deleted_at
    ON recipes(deletedAt);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_category
    ON recipes(category);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_title
    ON recipes(title);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_created_at
    ON recipes(createdAt);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_updated_at
    ON recipes(updatedAt);
  `);

  // Composite index for active recipes (not deleted)
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_active
    ON recipes(deletedAt, createdAt);
  `);

  console.log('Performance indexes created successfully');
};

/**
 * Rollback performance indexes migration
 * Drops all indexes created in the up migration
 */
export const down = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Drop indexes in reverse order
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_active;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_updated_at;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_created_at;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_title;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_category;');
  await db.execAsync('DROP INDEX IF EXISTS idx_recipes_deleted_at;');

  await db.execAsync(
    'DROP INDEX IF EXISTS idx_shopping_list_items_name;'
  );
  await db.execAsync(
    'DROP INDEX IF EXISTS idx_shopping_list_items_meal_plan_id;'
  );
  await db.execAsync(
    'DROP INDEX IF EXISTS idx_shopping_list_items_recipe_id;'
  );
  await db.execAsync(
    'DROP INDEX IF EXISTS idx_shopping_list_items_checked;'
  );

  await db.execAsync('DROP INDEX IF EXISTS idx_meal_plans_date;');
  await db.execAsync(
    'DROP INDEX IF EXISTS idx_meal_plans_recipe_id;'
  );
  await db.execAsync(
    'DROP INDEX IF EXISTS idx_meal_plans_date_meal_type;'
  );

  console.log('Performance indexes rolled back successfully');
};

/**
 * Migration metadata
 */
export const migration = {
  version: 2,
  name: '002_add_indexes',
  description: 'Add performance indexes for common query patterns',
  up,
  down,
};

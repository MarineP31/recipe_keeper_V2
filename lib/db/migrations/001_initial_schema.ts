import { dbConnection } from '../connection';

/**
 * Initial database schema migration
 * Creates all core tables for Recipe Keeper V2
 */
export const up = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Create recipes table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      servings INTEGER NOT NULL CHECK (servings >= 1 AND servings <= 50),
      category TEXT NOT NULL,
      ingredients TEXT NOT NULL, -- JSON array of Ingredient objects
      steps TEXT NOT NULL, -- JSON array of strings
      imageUri TEXT NULL,
      prepTime INTEGER NULL CHECK (prepTime >= 0 AND prepTime <= 1440),
      cookTime INTEGER NULL CHECK (cookTime >= 0 AND cookTime <= 1440),
      tags TEXT NULL, -- JSON array of strings
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT NULL
    );
  `);

  // Create meal_plans table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id TEXT PRIMARY KEY,
      recipeId TEXT NOT NULL,
      date TEXT NOT NULL CHECK (date LIKE '____-__-__'),
      mealType TEXT NOT NULL CHECK (mealType IN ('breakfast', 'lunch', 'dinner', 'snack')),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  // Create shopping_list_items table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shopping_list_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
      quantity REAL NULL CHECK (quantity IS NULL OR (quantity > 0 AND quantity <= 1000)),
      unit TEXT NULL,
      checked INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
      recipeId TEXT NULL,
      mealPlanId TEXT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (mealPlanId) REFERENCES meal_plans(id) ON DELETE CASCADE
    );
  `);

  console.log('Initial database schema created successfully');
};

/**
 * Rollback initial database schema
 * Drops all tables in reverse order
 */
export const down = async (): Promise<void> => {
  const db = dbConnection.getDatabase();

  // Drop tables in reverse order to handle foreign key constraints
  await db.execAsync('DROP TABLE IF EXISTS shopping_list_items;');
  await db.execAsync('DROP TABLE IF EXISTS meal_plans;');
  await db.execAsync('DROP TABLE IF EXISTS recipes;');

  console.log('Initial database schema rolled back successfully');
};

/**
 * Migration metadata
 */
export const migration = {
  version: 1,
  name: '001_initial_schema',
  description:
    'Create initial database schema with recipes, meal_plans, and shopping_list_items tables',
  up,
  down,
};

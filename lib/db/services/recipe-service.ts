import { v4 as uuidv4 } from 'uuid';
import { dbConnection, DatabaseError } from '../connection';
import {
  Recipe,
  RecipeRow,
  RecipeUtils,
  CreateRecipeInput,
  UpdateRecipeInput,
} from '../schema/recipe';

/**
 * Service for managing Recipe CRUD operations
 */
export class RecipeService {
  /**
   * Create a new recipe
   */
  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    // Create recipe with validation
    const recipe = RecipeUtils.create(input);
    recipe.id = uuidv4();

    // Validate recipe data
    const errors = RecipeUtils.validate(recipe);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Recipe validation failed: ${errors.join(', ')}`
      );
    }

    // Convert to database row
    const row = RecipeUtils.toRow(recipe);

    // Insert into database
    try {
      const query = `
        INSERT INTO recipes (
          id, title, servings, category, ingredients, steps,
          imageUri, prepTime, cookTime, tags, createdAt, updatedAt, deletedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbConnection.executeQuery(query, [
        row.id,
        row.title,
        row.servings,
        row.category,
        row.ingredients,
        row.steps,
        row.imageUri,
        row.prepTime,
        row.cookTime,
        row.tags,
        row.createdAt,
        row.updatedAt,
        row.deletedAt,
      ]);

      return recipe;
    } catch (error) {
      throw new DatabaseError(
        'CREATE_FAILED',
        `Failed to create recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Get a recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const query = `
        SELECT * FROM recipes
        WHERE id = ? AND deletedAt IS NULL
      `;

      const rows = await dbConnection.executeSelect<RecipeRow>(query, [
        id,
      ]);

      if (rows.length === 0) {
        return null;
      }

      return RecipeUtils.fromRow(rows[0]);
    } catch (error) {
      throw new DatabaseError(
        'GET_FAILED',
        `Failed to get recipe by ID: ${error}`,
        error
      );
    }
  }

  /**
   * Get all recipes with pagination support
   */
  async getAllRecipes(options?: {
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<Recipe[]> {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    const includeDeleted = options?.includeDeleted || false;

    try {
      let query = `
        SELECT * FROM recipes
      `;

      if (!includeDeleted) {
        query += ` WHERE deletedAt IS NULL`;
      }

      query += `
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const rows = await dbConnection.executeSelect<RecipeRow>(query, [
        limit,
        offset,
      ]);

      return rows.map((row) => RecipeUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_ALL_FAILED',
        `Failed to get all recipes: ${error}`,
        error
      );
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
    try {
      // Get existing recipe
      const existing = await this.getRecipeById(input.id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Recipe with ID ${input.id} not found`
        );
      }

      // Update recipe
      const updated = RecipeUtils.update(existing, input);

      // Validate updated recipe
      const errors = RecipeUtils.validate(updated);
      if (errors.length > 0) {
        throw new DatabaseError(
          'VALIDATION_ERROR',
          `Recipe validation failed: ${errors.join(', ')}`
        );
      }

      // Convert to database row
      const row = RecipeUtils.toRow(updated);

      // Build dynamic update query
      const updates: string[] = [];
      const params: any[] = [];

      if (input.title !== undefined) {
        updates.push('title = ?');
        params.push(row.title);
      }
      if (input.servings !== undefined) {
        updates.push('servings = ?');
        params.push(row.servings);
      }
      if (input.category !== undefined) {
        updates.push('category = ?');
        params.push(row.category);
      }
      if (input.ingredients !== undefined) {
        updates.push('ingredients = ?');
        params.push(row.ingredients);
      }
      if (input.steps !== undefined) {
        updates.push('steps = ?');
        params.push(row.steps);
      }
      if (input.imageUri !== undefined) {
        updates.push('imageUri = ?');
        params.push(row.imageUri);
      }
      if (input.prepTime !== undefined) {
        updates.push('prepTime = ?');
        params.push(row.prepTime);
      }
      if (input.cookTime !== undefined) {
        updates.push('cookTime = ?');
        params.push(row.cookTime);
      }
      if (input.tags !== undefined) {
        updates.push('tags = ?');
        params.push(row.tags);
      }

      // Always update updatedAt
      updates.push('updatedAt = ?');
      params.push(row.updatedAt);

      // Add ID to params
      params.push(input.id);

      const query = `
        UPDATE recipes
        SET ${updates.join(', ')}
        WHERE id = ? AND deletedAt IS NULL
      `;

      await dbConnection.executeQuery(query, params);

      return updated;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_FAILED',
        `Failed to update recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Soft delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    try {
      // Get existing recipe
      const existing = await this.getRecipeById(id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Recipe with ID ${id} not found`
        );
      }

      // Soft delete recipe
      const deleted = RecipeUtils.softDelete(existing);
      const row = RecipeUtils.toRow(deleted);

      const query = `
        UPDATE recipes
        SET deletedAt = ?, updatedAt = ?
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [
        row.deletedAt,
        row.updatedAt,
        id,
      ]);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'DELETE_FAILED',
        `Failed to delete recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Search recipes by title
   */
  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    try {
      const query = `
        SELECT * FROM recipes
        WHERE title LIKE ? AND deletedAt IS NULL
        ORDER BY createdAt DESC
      `;

      const rows = await dbConnection.executeSelect<RecipeRow>(query, [
        `%${searchTerm}%`,
      ]);

      return rows.map((row) => RecipeUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'SEARCH_FAILED',
        `Failed to search recipes: ${error}`,
        error
      );
    }
  }

  /**
   * Get recipe count
   */
  async getRecipeCount(includeDeleted = false): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM recipes`;

      if (!includeDeleted) {
        query += ` WHERE deletedAt IS NULL`;
      }

      const result = await dbConnection.executeSelect<{ count: number }>(
        query
      );

      return result[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(
        'COUNT_FAILED',
        `Failed to get recipe count: ${error}`,
        error
      );
    }
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const query = `
        SELECT * FROM recipes
        WHERE category = ? AND deletedAt IS NULL
        ORDER BY createdAt DESC
      `;

      const rows = await dbConnection.executeSelect<RecipeRow>(query, [
        category,
      ]);

      return rows.map((row) => RecipeUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_CATEGORY_FAILED',
        `Failed to get recipes by category: ${error}`,
        error
      );
    }
  }

  /**
   * Get recipes by tag
   */
  async getRecipesByTag(tag: string): Promise<Recipe[]> {
    try {
      const query = `
        SELECT * FROM recipes
        WHERE deletedAt IS NULL
        ORDER BY createdAt DESC
      `;

      const rows = await dbConnection.executeSelect<RecipeRow>(query);

      // Filter by tag in JSON array
      return rows
        .map((row) => RecipeUtils.fromRow(row))
        .filter((recipe) => recipe.tags.includes(tag));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_TAG_FAILED',
        `Failed to get recipes by tag: ${error}`,
        error
      );
    }
  }

  /**
   * Execute operations within a transaction
   */
  async executeInTransaction<T>(
    operation: (service: RecipeService) => Promise<T>
  ): Promise<T> {
    return await dbConnection.executeTransaction(async () => {
      return await operation(this);
    });
  }
}

// Export singleton instance
export const recipeService = new RecipeService();

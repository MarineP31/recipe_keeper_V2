import { v4 as uuidv4 } from 'uuid';
import { dbConnection, DatabaseError } from '../connection';
import {
  MealPlan,
  MealPlanRow,
  MealPlanUtils,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  MealPlanWithRecipe,
} from '../schema/meal-plan';
import { MealType } from '@/constants/enums';

/**
 * Service for managing MealPlan CRUD operations
 */
export class MealPlanService {
  /**
   * Create a new meal plan
   */
  async createMealPlan(input: CreateMealPlanInput): Promise<MealPlan> {
    // Create meal plan with validation
    const mealPlan = MealPlanUtils.create(input);
    mealPlan.id = uuidv4();

    // Validate meal plan data
    const errors = MealPlanUtils.validate(mealPlan);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Meal plan validation failed: ${errors.join(', ')}`
      );
    }

    // Convert to database row
    const row = MealPlanUtils.toRow(mealPlan);

    // Insert into database
    try {
      const query = `
        INSERT INTO meal_plans (id, recipeId, date, mealType, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `;

      await dbConnection.executeQuery(query, [
        row.id,
        row.recipeId,
        row.date,
        row.mealType,
        row.createdAt,
      ]);

      return mealPlan;
    } catch (error) {
      throw new DatabaseError(
        'CREATE_FAILED',
        `Failed to create meal plan: ${error}`,
        error
      );
    }
  }

  /**
   * Get meal plan by ID
   */
  async getMealPlanById(id: string): Promise<MealPlan | null> {
    try {
      const query = `
        SELECT * FROM meal_plans
        WHERE id = ?
      `;

      const rows = await dbConnection.executeSelect<MealPlanRow>(query, [
        id,
      ]);

      if (rows.length === 0) {
        return null;
      }

      return MealPlanUtils.fromRow(rows[0]);
    } catch (error) {
      throw new DatabaseError(
        'GET_FAILED',
        `Failed to get meal plan by ID: ${error}`,
        error
      );
    }
  }

  /**
   * Get meal plans by date
   */
  async getMealPlansByDate(date: string): Promise<MealPlan[]> {
    try {
      const query = `
        SELECT * FROM meal_plans
        WHERE date = ?
        ORDER BY mealType
      `;

      const rows = await dbConnection.executeSelect<MealPlanRow>(query, [
        date,
      ]);

      return rows.map((row) => MealPlanUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_DATE_FAILED',
        `Failed to get meal plans by date: ${error}`,
        error
      );
    }
  }

  /**
   * Get meal plans by date range
   */
  async getMealPlansByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MealPlan[]> {
    try {
      const query = `
        SELECT * FROM meal_plans
        WHERE date >= ? AND date <= ?
        ORDER BY date, mealType
      `;

      const rows = await dbConnection.executeSelect<MealPlanRow>(query, [
        startDate,
        endDate,
      ]);

      return rows.map((row) => MealPlanUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_DATE_RANGE_FAILED',
        `Failed to get meal plans by date range: ${error}`,
        error
      );
    }
  }

  /**
   * Get meal plans by recipe ID
   */
  async getMealPlansByRecipe(recipeId: string): Promise<MealPlan[]> {
    try {
      const query = `
        SELECT * FROM meal_plans
        WHERE recipeId = ?
        ORDER BY date DESC
      `;

      const rows = await dbConnection.executeSelect<MealPlanRow>(query, [
        recipeId,
      ]);

      return rows.map((row) => MealPlanUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_RECIPE_FAILED',
        `Failed to get meal plans by recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Get meal plan with recipe details
   */
  async getMealPlansWithRecipe(
    startDate?: string,
    endDate?: string
  ): Promise<MealPlanWithRecipe[]> {
    try {
      let query = `
        SELECT
          mp.*,
          r.title as recipeTitle,
          r.imageUri as recipeImageUri,
          r.servings as recipeServings,
          r.prepTime as recipePrepTime,
          r.cookTime as recipeCookTime
        FROM meal_plans mp
        LEFT JOIN recipes r ON mp.recipeId = r.id
      `;

      const params: string[] = [];

      if (startDate && endDate) {
        query += ` WHERE mp.date >= ? AND mp.date <= ?`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY mp.date, mp.mealType`;

      const rows = await dbConnection.executeSelect<any>(query, params);

      return rows.map((row) => ({
        id: row.id,
        recipeId: row.recipeId,
        date: row.date,
        mealType: row.mealType as MealType,
        createdAt: row.createdAt,
        recipeTitle: row.recipeTitle,
        recipeImageUri: row.recipeImageUri,
        recipeServings: row.recipeServings,
        recipePrepTime: row.recipePrepTime,
        recipeCookTime: row.recipeCookTime,
      }));
    } catch (error) {
      throw new DatabaseError(
        'GET_WITH_RECIPE_FAILED',
        `Failed to get meal plans with recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Update an existing meal plan
   */
  async updateMealPlan(input: UpdateMealPlanInput): Promise<MealPlan> {
    try {
      // Get existing meal plan
      const existing = await this.getMealPlanById(input.id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Meal plan with ID ${input.id} not found`
        );
      }

      // Update meal plan
      const updated = MealPlanUtils.update(existing, input);

      // Validate updated meal plan
      const errors = MealPlanUtils.validate(updated);
      if (errors.length > 0) {
        throw new DatabaseError(
          'VALIDATION_ERROR',
          `Meal plan validation failed: ${errors.join(', ')}`
        );
      }

      // Convert to database row
      const row = MealPlanUtils.toRow(updated);

      // Build dynamic update query
      const updates: string[] = [];
      const params: any[] = [];

      if (input.recipeId !== undefined) {
        updates.push('recipeId = ?');
        params.push(row.recipeId);
      }
      if (input.date !== undefined) {
        updates.push('date = ?');
        params.push(row.date);
      }
      if (input.mealType !== undefined) {
        updates.push('mealType = ?');
        params.push(row.mealType);
      }

      if (updates.length === 0) {
        return existing;
      }

      // Add ID to params
      params.push(input.id);

      const query = `
        UPDATE meal_plans
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, params);

      return updated;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_FAILED',
        `Failed to update meal plan: ${error}`,
        error
      );
    }
  }

  /**
   * Delete a meal plan (hard delete)
   */
  async deleteMealPlan(id: string): Promise<void> {
    try {
      const query = `
        DELETE FROM meal_plans
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [id]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_FAILED',
        `Failed to delete meal plan: ${error}`,
        error
      );
    }
  }

  /**
   * Delete meal plans by date
   */
  async deleteMealPlansByDate(date: string): Promise<void> {
    try {
      const query = `
        DELETE FROM meal_plans
        WHERE date = ?
      `;

      await dbConnection.executeQuery(query, [date]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_DATE_FAILED',
        `Failed to delete meal plans by date: ${error}`,
        error
      );
    }
  }

  /**
   * Delete meal plans by recipe ID
   */
  async deleteMealPlansByRecipe(recipeId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM meal_plans
        WHERE recipeId = ?
      `;

      await dbConnection.executeQuery(query, [recipeId]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_RECIPE_FAILED',
        `Failed to delete meal plans by recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Create multiple meal plans in a batch
   */
  async createMealPlansBatch(
    inputs: CreateMealPlanInput[]
  ): Promise<MealPlan[]> {
    return await dbConnection.executeTransaction(async () => {
      const mealPlans: MealPlan[] = [];

      for (const input of inputs) {
        const mealPlan = await this.createMealPlan(input);
        mealPlans.push(mealPlan);
      }

      return mealPlans;
    });
  }

  /**
   * Delete multiple meal plans in a batch
   */
  async deleteMealPlansBatch(ids: string[]): Promise<void> {
    return await dbConnection.executeTransaction(async () => {
      for (const id of ids) {
        await this.deleteMealPlan(id);
      }
    });
  }

  /**
   * Get meal plan count
   */
  async getMealPlanCount(): Promise<number> {
    try {
      const query = `SELECT COUNT(*) as count FROM meal_plans`;

      const result = await dbConnection.executeSelect<{ count: number }>(
        query
      );

      return result[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(
        'COUNT_FAILED',
        `Failed to get meal plan count: ${error}`,
        error
      );
    }
  }

  /**
   * Check if a meal slot is available
   */
  async isMealSlotAvailable(
    date: string,
    mealType: MealType
  ): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM meal_plans
        WHERE date = ? AND mealType = ?
      `;

      const result = await dbConnection.executeSelect<{ count: number }>(
        query,
        [date, mealType]
      );

      return (result[0]?.count || 0) === 0;
    } catch (error) {
      throw new DatabaseError(
        'SLOT_CHECK_FAILED',
        `Failed to check meal slot availability: ${error}`,
        error
      );
    }
  }

  /**
   * Execute operations within a transaction
   */
  async executeInTransaction<T>(
    operation: (service: MealPlanService) => Promise<T>
  ): Promise<T> {
    return await dbConnection.executeTransaction(async () => {
      return await operation(this);
    });
  }
}

// Export singleton instance
export const mealPlanService = new MealPlanService();

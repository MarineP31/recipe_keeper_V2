import { v4 as uuidv4 } from 'uuid';
import { dbConnection, DatabaseError } from '../connection';
import {
  ShoppingListItem,
  ShoppingListItemRow,
  ShoppingListItemUtils,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  ShoppingListItemWithRecipe,
} from '../schema/shopping-list';

/**
 * Service for managing ShoppingListItem CRUD operations
 */
export class ShoppingListService {
  /**
   * Create a new shopping list item
   */
  async createShoppingListItem(
    input: CreateShoppingListItemInput
  ): Promise<ShoppingListItem> {
    // Create shopping list item with validation
    const item = ShoppingListItemUtils.create(input);
    item.id = uuidv4();

    // Validate item data
    const errors = ShoppingListItemUtils.validate(item);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Shopping list item validation failed: ${errors.join(', ')}`
      );
    }

    // Convert to database row
    const row = ShoppingListItemUtils.toRow(item);

    // Insert into database
    try {
      const query = `
        INSERT INTO shopping_list_items (
          id, name, quantity, unit, checked, recipeId, mealPlanId, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbConnection.executeQuery(query, [
        row.id,
        row.name,
        row.quantity,
        row.unit,
        row.checked,
        row.recipeId,
        row.mealPlanId,
        row.createdAt,
      ]);

      return item;
    } catch (error) {
      throw new DatabaseError(
        'CREATE_FAILED',
        `Failed to create shopping list item: ${error}`,
        error
      );
    }
  }

  /**
   * Get shopping list item by ID
   */
  async getShoppingListItemById(
    id: string
  ): Promise<ShoppingListItem | null> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE id = ?
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [
          id,
        ]);

      if (rows.length === 0) {
        return null;
      }

      return ShoppingListItemUtils.fromRow(rows[0]);
    } catch (error) {
      throw new DatabaseError(
        'GET_FAILED',
        `Failed to get shopping list item by ID: ${error}`,
        error
      );
    }
  }

  /**
   * Get all shopping list items with filtering
   */
  async getAllShoppingItems(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
    recipeOnly?: boolean;
    manualOnly?: boolean;
  }): Promise<ShoppingListItem[]> {
    try {
      let query = `
        SELECT * FROM shopping_list_items
        WHERE 1=1
      `;
      const params: any[] = [];

      if (options?.checkedOnly) {
        query += ` AND checked = 1`;
      }

      if (options?.uncheckedOnly) {
        query += ` AND checked = 0`;
      }

      if (options?.recipeOnly) {
        query += ` AND recipeId IS NOT NULL`;
      }

      if (options?.manualOnly) {
        query += ` AND recipeId IS NULL`;
      }

      query += ` ORDER BY checked ASC, createdAt DESC`;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(
          query,
          params
        );

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_ALL_FAILED',
        `Failed to get all shopping list items: ${error}`,
        error
      );
    }
  }

  /**
   * Get shopping list items with recipe details
   */
  async getShoppingItemsWithRecipe(): Promise<
    ShoppingListItemWithRecipe[]
  > {
    try {
      const query = `
        SELECT
          sli.*,
          r.title as recipeTitle,
          r.imageUri as recipeImageUri
        FROM shopping_list_items sli
        LEFT JOIN recipes r ON sli.recipeId = r.id
        ORDER BY sli.checked ASC, sli.createdAt DESC
      `;

      const rows = await dbConnection.executeSelect<any>(query);

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        unit: row.unit,
        checked: row.checked === 1,
        recipeId: row.recipeId,
        mealPlanId: row.mealPlanId,
        createdAt: row.createdAt,
        recipeTitle: row.recipeTitle,
        recipeImageUri: row.recipeImageUri,
      }));
    } catch (error) {
      throw new DatabaseError(
        'GET_WITH_RECIPE_FAILED',
        `Failed to get shopping items with recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Get shopping list items by recipe ID
   */
  async getShoppingItemsByRecipe(
    recipeId: string
  ): Promise<ShoppingListItem[]> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE recipeId = ?
        ORDER BY createdAt DESC
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [
          recipeId,
        ]);

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_RECIPE_FAILED',
        `Failed to get shopping items by recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Get shopping list items by meal plan ID
   */
  async getShoppingItemsByMealPlan(
    mealPlanId: string
  ): Promise<ShoppingListItem[]> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE mealPlanId = ?
        ORDER BY createdAt DESC
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [
          mealPlanId,
        ]);

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_MEAL_PLAN_FAILED',
        `Failed to get shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  /**
   * Update checked state of a shopping list item
   */
  async updateCheckedState(
    id: string,
    checked: boolean
  ): Promise<ShoppingListItem> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = ?
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [checked ? 1 : 0, id]);

      const item = await this.getShoppingListItemById(id);
      if (!item) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Shopping list item with ID ${id} not found`
        );
      }

      return item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_CHECKED_FAILED',
        `Failed to update checked state: ${error}`,
        error
      );
    }
  }

  /**
   * Update a shopping list item
   */
  async updateShoppingItem(
    input: UpdateShoppingListItemInput
  ): Promise<ShoppingListItem> {
    try {
      // Get existing item
      const existing = await this.getShoppingListItemById(input.id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Shopping list item with ID ${input.id} not found`
        );
      }

      // Update item
      const updated = ShoppingListItemUtils.update(existing, input);

      // Validate updated item
      const errors = ShoppingListItemUtils.validate(updated);
      if (errors.length > 0) {
        throw new DatabaseError(
          'VALIDATION_ERROR',
          `Shopping list item validation failed: ${errors.join(', ')}`
        );
      }

      // Convert to database row
      const row = ShoppingListItemUtils.toRow(updated);

      // Build dynamic update query
      const updates: string[] = [];
      const params: any[] = [];

      if (input.name !== undefined) {
        updates.push('name = ?');
        params.push(row.name);
      }
      if (input.quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(row.quantity);
      }
      if (input.unit !== undefined) {
        updates.push('unit = ?');
        params.push(row.unit);
      }
      if (input.checked !== undefined) {
        updates.push('checked = ?');
        params.push(row.checked);
      }

      if (updates.length === 0) {
        return existing;
      }

      // Add ID to params
      params.push(input.id);

      const query = `
        UPDATE shopping_list_items
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
        `Failed to update shopping list item: ${error}`,
        error
      );
    }
  }

  /**
   * Delete a shopping list item (hard delete)
   */
  async deleteShoppingItem(id: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [id]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_FAILED',
        `Failed to delete shopping list item: ${error}`,
        error
      );
    }
  }

  /**
   * Delete all checked items
   */
  async deleteAllCheckedItems(): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE checked = 1
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_CHECKED_FAILED',
        `Failed to delete checked items: ${error}`,
        error
      );
    }
  }

  /**
   * Delete shopping items by recipe ID
   */
  async deleteShoppingItemsByRecipe(recipeId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE recipeId = ?
      `;

      await dbConnection.executeQuery(query, [recipeId]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_RECIPE_FAILED',
        `Failed to delete shopping items by recipe: ${error}`,
        error
      );
    }
  }

  /**
   * Delete shopping items by meal plan ID
   */
  async deleteShoppingItemsByMealPlan(mealPlanId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE mealPlanId = ?
      `;

      await dbConnection.executeQuery(query, [mealPlanId]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_MEAL_PLAN_FAILED',
        `Failed to delete shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  /**
   * Create multiple shopping list items in a batch
   */
  async createShoppingItemsBatch(
    inputs: CreateShoppingListItemInput[]
  ): Promise<ShoppingListItem[]> {
    return await dbConnection.executeTransaction(async () => {
      const items: ShoppingListItem[] = [];

      for (const input of inputs) {
        const item = await this.createShoppingListItem(input);
        items.push(item);
      }

      return items;
    });
  }

  /**
   * Delete multiple shopping list items in a batch
   */
  async deleteShoppingItemsBatch(ids: string[]): Promise<void> {
    return await dbConnection.executeTransaction(async () => {
      for (const id of ids) {
        await this.deleteShoppingItem(id);
      }
    });
  }

  /**
   * Mark all items as checked
   */
  async checkAllItems(): Promise<void> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = 1
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'CHECK_ALL_FAILED',
        `Failed to check all items: ${error}`,
        error
      );
    }
  }

  /**
   * Mark all items as unchecked
   */
  async uncheckAllItems(): Promise<void> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = 0
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'UNCHECK_ALL_FAILED',
        `Failed to uncheck all items: ${error}`,
        error
      );
    }
  }

  /**
   * Get shopping list item count
   */
  async getShoppingItemCount(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
  }): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM shopping_list_items WHERE 1=1`;

      if (options?.checkedOnly) {
        query += ` AND checked = 1`;
      }

      if (options?.uncheckedOnly) {
        query += ` AND checked = 0`;
      }

      const result = await dbConnection.executeSelect<{ count: number }>(
        query
      );

      return result[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(
        'COUNT_FAILED',
        `Failed to get shopping item count: ${error}`,
        error
      );
    }
  }

  /**
   * Execute operations within a transaction
   */
  async executeInTransaction<T>(
    operation: (service: ShoppingListService) => Promise<T>
  ): Promise<T> {
    return await dbConnection.executeTransaction(async () => {
      return await operation(this);
    });
  }
}

// Export singleton instance
export const shoppingListService = new ShoppingListService();

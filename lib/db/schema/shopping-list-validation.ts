import { z } from 'zod';
import { MeasurementUnit } from '@/constants/enums';

/**
 * Zod schema for ShoppingListItem validation
 */
export const ShoppingListItemSchema = z.object({
  id: z.string().uuid('Invalid shopping list item ID format'),
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be 100 characters or less'),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(1000, 'Quantity must be 1000 or less')
    .nullable()
    .optional(),
  unit: z.nativeEnum(MeasurementUnit).nullable().optional(),
  checked: z.boolean(),
  recipeId: z
    .string()
    .uuid('Invalid recipe ID format')
    .nullable()
    .optional(),
  mealPlanId: z
    .string()
    .uuid('Invalid meal plan ID format')
    .nullable()
    .optional(),
  createdAt: z.string().datetime('Invalid created date format'),
});

/**
 * Zod schema for creating a new shopping list item
 */
export const CreateShoppingListItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be 100 characters or less'),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(1000, 'Quantity must be 1000 or less')
    .nullable()
    .optional(),
  unit: z.nativeEnum(MeasurementUnit).nullable().optional(),
  checked: z.boolean().optional(),
  recipeId: z
    .string()
    .uuid('Invalid recipe ID format')
    .nullable()
    .optional(),
  mealPlanId: z
    .string()
    .uuid('Invalid meal plan ID format')
    .nullable()
    .optional(),
});

/**
 * Zod schema for updating an existing shopping list item
 */
export const UpdateShoppingListItemSchema = z.object({
  id: z.string().uuid('Invalid shopping list item ID format'),
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be 100 characters or less')
    .optional(),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(1000, 'Quantity must be 1000 or less')
    .nullable()
    .optional(),
  unit: z.nativeEnum(MeasurementUnit).nullable().optional(),
  checked: z.boolean().optional(),
});

/**
 * Zod schema for bulk shopping list item creation
 */
export const BulkCreateShoppingListItemSchema = z.object({
  items: z
    .array(CreateShoppingListItemSchema)
    .min(1, 'At least one item is required')
    .max(100, 'Maximum 100 items allowed'),
});

/**
 * Type inference from Zod schemas
 */
export type ShoppingListItemInput = z.infer<
  typeof ShoppingListItemSchema
>;
export type CreateShoppingListItemInput = z.infer<
  typeof CreateShoppingListItemSchema
>;
export type UpdateShoppingListItemInput = z.infer<
  typeof UpdateShoppingListItemSchema
>;
export type BulkCreateShoppingListItemInput = z.infer<
  typeof BulkCreateShoppingListItemSchema
>;

/**
 * Validation utility functions
 */
export const ShoppingListItemValidation = {
  /**
   * Validate shopping list item data using Zod schema
   */
  validateShoppingListItem(
    item: unknown
  ):
    | { success: true; data: ShoppingListItemInput }
    | { success: false; errors: string[] } {
    try {
      const validatedItem = ShoppingListItemSchema.parse(item);
      return { success: true, data: validatedItem };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  },

  /**
   * Validate create shopping list item input using Zod schema
   */
  validateCreateShoppingListItem(
    input: unknown
  ):
    | { success: true; data: CreateShoppingListItemInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput =
        CreateShoppingListItemSchema.parse(input);
      return { success: true, data: validatedInput };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  },

  /**
   * Validate update shopping list item input using Zod schema
   */
  validateUpdateShoppingListItem(
    input: unknown
  ):
    | { success: true; data: UpdateShoppingListItemInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput =
        UpdateShoppingListItemSchema.parse(input);
      return { success: true, data: validatedInput };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  },

  /**
   * Validate bulk create shopping list items input using Zod schema
   */
  validateBulkCreateShoppingListItems(
    input: unknown
  ):
    | { success: true; data: BulkCreateShoppingListItemInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput =
        BulkCreateShoppingListItemSchema.parse(input);
      return { success: true, data: validatedInput };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  },

  /**
   * Validate item name
   */
  validateItemName(name: string): boolean {
    return name.length > 0 && name.length <= 100;
  },

  /**
   * Validate quantity
   */
  validateQuantity(quantity: number | null): boolean {
    if (quantity === null) return true;
    return quantity > 0 && quantity <= 1000;
  },

  /**
   * Validate unit
   */
  validateUnit(unit: string | null): boolean {
    if (unit === null) return true;
    return Object.values(MeasurementUnit).includes(
      unit as MeasurementUnit
    );
  },

  /**
   * Validate recipe ID format
   */
  validateRecipeId(recipeId: string | null): boolean {
    if (recipeId === null) return true;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(recipeId);
  },
};

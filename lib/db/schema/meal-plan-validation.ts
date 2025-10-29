import { z } from 'zod';
import { MealType } from '@/constants/enums';

/**
 * Zod schema for MealPlan validation
 */
export const MealPlanSchema = z.object({
  id: z.string().uuid('Invalid meal plan ID format'),
  recipeId: z.string().uuid('Invalid recipe ID format'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return (
        parsedDate instanceof Date && !isNaN(parsedDate.getTime())
      );
    }, 'Invalid date'),
  mealType: z.nativeEnum(MealType, {
    errorMap: () => ({ message: 'Invalid meal type' }),
  }),
  createdAt: z.string().datetime('Invalid created date format'),
});

/**
 * Zod schema for creating a new meal plan
 */
export const CreateMealPlanSchema = z.object({
  recipeId: z.string().uuid('Invalid recipe ID format'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return (
        parsedDate instanceof Date && !isNaN(parsedDate.getTime())
      );
    }, 'Invalid date'),
  mealType: z.nativeEnum(MealType, {
    errorMap: () => ({ message: 'Invalid meal type' }),
  }),
});

/**
 * Zod schema for updating an existing meal plan
 */
export const UpdateMealPlanSchema = z.object({
  id: z.string().uuid('Invalid meal plan ID format'),
  recipeId: z.string().uuid('Invalid recipe ID format').optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return (
        parsedDate instanceof Date && !isNaN(parsedDate.getTime())
      );
    }, 'Invalid date')
    .optional(),
  mealType: z
    .nativeEnum(MealType, {
      errorMap: () => ({ message: 'Invalid meal type' }),
    })
    .optional(),
});

/**
 * Type inference from Zod schemas
 */
export type MealPlanInput = z.infer<typeof MealPlanSchema>;
export type CreateMealPlanInput = z.infer<
  typeof CreateMealPlanSchema
>;
export type UpdateMealPlanInput = z.infer<
  typeof UpdateMealPlanSchema
>;

/**
 * Validation utility functions
 */
export const MealPlanValidation = {
  /**
   * Validate meal plan data using Zod schema
   */
  validateMealPlan(
    mealPlan: unknown
  ):
    | { success: true; data: MealPlanInput }
    | { success: false; errors: string[] } {
    try {
      const validatedMealPlan = MealPlanSchema.parse(mealPlan);
      return { success: true, data: validatedMealPlan };
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
   * Validate create meal plan input using Zod schema
   */
  validateCreateMealPlan(
    input: unknown
  ):
    | { success: true; data: CreateMealPlanInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput = CreateMealPlanSchema.parse(input);
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
   * Validate update meal plan input using Zod schema
   */
  validateUpdateMealPlan(
    input: unknown
  ):
    | { success: true; data: UpdateMealPlanInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput = UpdateMealPlanSchema.parse(input);
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
   * Validate date string format
   */
  validateDate(dateString: string): boolean {
    const result = z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Date must be in YYYY-MM-DD format'
      )
      .refine((date) => {
        const parsedDate = new Date(date);
        return (
          parsedDate instanceof Date && !isNaN(parsedDate.getTime())
        );
      }, 'Invalid date')
      .safeParse(dateString);

    return result.success;
  },

  /**
   * Validate meal type
   */
  validateMealType(mealType: string): boolean {
    return Object.values(MealType).includes(mealType as MealType);
  },
};

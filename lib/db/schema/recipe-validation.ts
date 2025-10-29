import { z } from 'zod';
import {
  DishCategory,
  MeasurementUnit,
  VALIDATION_CONSTRAINTS,
} from '@/constants/enums';

/**
 * Zod schema for Ingredient validation
 */
export const IngredientSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .max(
      VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH,
      `Ingredient name must be ${VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH} characters or less`
    ),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(1000, 'Quantity must be 1000 or less')
    .nullable()
    .optional(),
  unit: z.nativeEnum(MeasurementUnit).nullable().optional(),
});

/**
 * Zod schema for Recipe validation
 */
export const RecipeSchema = z.object({
  id: z.string().uuid('Invalid recipe ID format'),
  title: z
    .string()
    .min(1, 'Recipe title is required')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH,
      `Recipe title must be ${VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH} characters or less`
    ),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN,
      `Servings must be at least ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN}`
    )
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX,
      `Servings must be at most ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX}`
    ),
  category: z.nativeEnum(DishCategory, {
    errorMap: () => ({ message: 'Invalid dish category' }),
  }),
  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed'),
  steps: z
    .array(
      z
        .string()
        .min(1, 'Step cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH,
          `Step must be ${VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH} characters or less`
        )
    )
    .min(1, 'At least one step is required')
    .max(50, 'Maximum 50 steps allowed'),
  imageUri: z
    .string()
    .url('Invalid image URI format')
    .nullable()
    .optional(),
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX,
      `Prep time must be ${VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX,
      `Cook time must be ${VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH,
          `Tag must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`
        )
    )
    .max(
      VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE,
      `Maximum ${VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE} tags allowed`
    )
    .optional(),
  createdAt: z.string().datetime('Invalid created date format'),
  updatedAt: z.string().datetime('Invalid updated date format'),
  deletedAt: z
    .string()
    .datetime('Invalid deleted date format')
    .nullable()
    .optional(),
});

/**
 * Zod schema for creating a new recipe
 */
export const CreateRecipeSchema = z.object({
  title: z
    .string()
    .min(1, 'Recipe title is required')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH,
      `Recipe title must be ${VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH} characters or less`
    ),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN,
      `Servings must be at least ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN}`
    )
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX,
      `Servings must be at most ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX}`
    ),
  category: z.nativeEnum(DishCategory, {
    errorMap: () => ({ message: 'Invalid dish category' }),
  }),
  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed'),
  steps: z
    .array(
      z
        .string()
        .min(1, 'Step cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH,
          `Step must be ${VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH} characters or less`
        )
    )
    .min(1, 'At least one step is required')
    .max(50, 'Maximum 50 steps allowed'),
  imageUri: z
    .string()
    .url('Invalid image URI format')
    .nullable()
    .optional(),
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX,
      `Prep time must be ${VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX,
      `Cook time must be ${VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH,
          `Tag must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`
        )
    )
    .max(
      VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE,
      `Maximum ${VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE} tags allowed`
    )
    .optional(),
});

/**
 * Zod schema for updating an existing recipe
 */
export const UpdateRecipeSchema = z.object({
  id: z.string().uuid('Invalid recipe ID format'),
  title: z
    .string()
    .min(1, 'Recipe title is required')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH,
      `Recipe title must be ${VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH} characters or less`
    )
    .optional(),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN,
      `Servings must be at least ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN}`
    )
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX,
      `Servings must be at most ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX}`
    )
    .optional(),
  category: z
    .nativeEnum(DishCategory, {
      errorMap: () => ({ message: 'Invalid dish category' }),
    })
    .optional(),
  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed')
    .optional(),
  steps: z
    .array(
      z
        .string()
        .min(1, 'Step cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH,
          `Step must be ${VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH} characters or less`
        )
    )
    .min(1, 'At least one step is required')
    .max(50, 'Maximum 50 steps allowed')
    .optional(),
  imageUri: z
    .string()
    .url('Invalid image URI format')
    .nullable()
    .optional(),
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX,
      `Prep time must be ${VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX,
      `Cook time must be ${VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag cannot be empty')
        .max(
          VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH,
          `Tag must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`
        )
    )
    .max(
      VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE,
      `Maximum ${VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE} tags allowed`
    )
    .optional(),
});

/**
 * Type inference from Zod schemas
 */
export type IngredientInput = z.infer<typeof IngredientSchema>;
export type RecipeInput = z.infer<typeof RecipeSchema>;
export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;

/**
 * Validation utility functions
 */
export const RecipeValidation = {
  /**
   * Validate recipe data using Zod schema
   */
  validateRecipe(
    recipe: unknown
  ):
    | { success: true; data: RecipeInput }
    | { success: false; errors: string[] } {
    try {
      const validatedRecipe = RecipeSchema.parse(recipe);
      return { success: true, data: validatedRecipe };
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
   * Validate create recipe input using Zod schema
   */
  validateCreateRecipe(
    input: unknown
  ):
    | { success: true; data: CreateRecipeInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput = CreateRecipeSchema.parse(input);
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
   * Validate update recipe input using Zod schema
   */
  validateUpdateRecipe(
    input: unknown
  ):
    | { success: true; data: UpdateRecipeInput }
    | { success: false; errors: string[] } {
    try {
      const validatedInput = UpdateRecipeSchema.parse(input);
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
   * Validate ingredient data using Zod schema
   */
  validateIngredient(
    ingredient: unknown
  ):
    | { success: true; data: IngredientInput }
    | { success: false; errors: string[] } {
    try {
      const validatedIngredient = IngredientSchema.parse(ingredient);
      return { success: true, data: validatedIngredient };
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
};

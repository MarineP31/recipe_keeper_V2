/**
 * Zod Validation Schema for Recipe Form
 * Task Group 5.2: Recipe form validation
 */

import { z } from 'zod';
import { DishCategory, MeasurementUnit, VALIDATION_CONSTRAINTS } from '@/constants/enums';

/**
 * Ingredient schema with required name and optional quantity/unit
 */
const IngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(
    VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH,
    `Ingredient name must be ${VALIDATION_CONSTRAINTS.INGREDIENT_NAME_MAX_LENGTH} characters or less`
  ),
  quantity: z.number().positive('Quantity must be positive').nullable(),
  unit: z.nativeEnum(MeasurementUnit).nullable(),
});

/**
 * Step schema with required instruction
 */
const StepSchema = z.string().min(1, 'Step instruction is required').max(
  VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH,
  `Step instruction must be ${VALIDATION_CONSTRAINTS.INSTRUCTION_STEP_MAX_LENGTH} characters or less`
);

/**
 * Recipe form validation schema
 */
export const RecipeFormSchema = z.object({
  // Required fields
  title: z.string().min(1, 'Title is required').max(
    VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH,
    `Title must be ${VALIDATION_CONSTRAINTS.RECIPE_TITLE_MAX_LENGTH} characters or less`
  ),
  servings: z.number()
    .int('Servings must be a whole number')
    .min(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN,
      `Servings must be at least ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MIN}`
    )
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX,
      `Servings must be ${VALIDATION_CONSTRAINTS.RECIPE_SERVINGS_MAX} or less`
    ),
  category: z.nativeEnum(DishCategory, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  steps: z.array(StepSchema).min(1, 'At least one step is required'),

  // Optional fields
  prepTime: z.number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX,
      `Prep time must be ${VALIDATION_CONSTRAINTS.RECIPE_PREP_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  cookTime: z.number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(
      VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX,
      `Cook time must be ${VALIDATION_CONSTRAINTS.RECIPE_COOK_TIME_MAX} minutes or less`
    )
    .nullable()
    .optional(),
  tags: z.array(
    z.string().max(
      VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH,
      `Tag must be ${VALIDATION_CONSTRAINTS.TAG_NAME_MAX_LENGTH} characters or less`
    )
  ).max(
    VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE,
    `Maximum ${VALIDATION_CONSTRAINTS.MAX_TAGS_PER_RECIPE} tags allowed`
  ).optional(),
  imageUri: z.string().nullable().optional(),
});

/**
 * Type inference from schema
 */
export type RecipeFormData = z.infer<typeof RecipeFormSchema>;

/**
 * Type for form validation errors
 */
export type RecipeFormErrors = {
  [K in keyof RecipeFormData]?: string[];
};

/**
 * Helper function to validate recipe form data
 */
export function validateRecipeForm(data: unknown): {
  success: boolean;
  data?: RecipeFormData;
  errors?: RecipeFormErrors;
} {
  const result = RecipeFormSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.flatten().fieldErrors as RecipeFormErrors,
  };
}

/**
 * Helper to get user-friendly error message for a field
 */
export function getFieldError(
  errors: RecipeFormErrors | undefined,
  field: keyof RecipeFormData
): string | undefined {
  if (!errors || !errors[field]) return undefined;
  const fieldErrors = errors[field];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
}

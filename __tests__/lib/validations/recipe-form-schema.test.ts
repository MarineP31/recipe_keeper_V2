/**
 * Task 12.1: Unit Tests for Recipe Form Validation
 * Tests for recipe form validation schema with Zod
 */

import { describe, it, expect } from '@jest/globals';
import {
  RecipeFormSchema,
  IngredientSchema,
  StepSchema,
  TagSchema,
  validateRecipeForm,
  validateIngredient,
  validateStep,
  validateTag,
} from '@/lib/validations/recipe-form-schema';
import { DishCategory, MeasurementUnit } from '@/constants/enums';

describe('Recipe Form Schema Validation', () => {
  describe('RecipeFormSchema', () => {
    it('should validate valid recipe data with all fields', () => {
      const validData = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP },
        ],
        steps: ['Mix ingredients', 'Bake for 30 minutes'],
        imageUri: 'file:///path/to/image.jpg',
        prepTime: 15,
        cookTime: 30,
        tags: ['Italian', 'Vegetarian'],
        source: 'Test source',
      };

      const result = RecipeFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate valid recipe data with minimal required fields', () => {
      const minimalData = {
        title: 'Simple Recipe',
        servings: 2,
        category: DishCategory.BREAKFAST,
        ingredients: [{ name: 'Egg', quantity: null, unit: null }],
        steps: ['Cook the egg'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
        source: null,
      };

      const result = RecipeFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject recipe without title', () => {
      const invalidData = {
        title: '',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title is required');
      }
    });

    it('should reject recipe with title exceeding max length', () => {
      const longTitle = 'a'.repeat(201);
      const invalidData = {
        title: longTitle,
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200 characters');
      }
    });

    it('should reject recipe without ingredients', () => {
      const invalidData = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [],
        steps: ['Mix ingredients'],
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one ingredient');
      }
    });

    it('should reject recipe without steps', () => {
      const invalidData = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: [],
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one step');
      }
    });

    it('should reject recipe with invalid servings (zero)', () => {
      const invalidData = {
        title: 'Test Recipe',
        servings: 0,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject recipe with negative prep time', () => {
      const invalidData = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
        prepTime: -5,
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be negative');
      }
    });

    it('should reject recipe with negative cook time', () => {
      const invalidData = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
        cookTime: -10,
      };

      const result = RecipeFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('IngredientSchema', () => {
    it('should validate ingredient with all fields', () => {
      const ingredient = {
        name: 'All-purpose flour',
        quantity: 2.5,
        unit: MeasurementUnit.CUP,
      };

      const result = IngredientSchema.safeParse(ingredient);
      expect(result.success).toBe(true);
    });

    it('should validate ingredient with only name', () => {
      const ingredient = {
        name: 'Salt',
        quantity: null,
        unit: null,
      };

      const result = IngredientSchema.safeParse(ingredient);
      expect(result.success).toBe(true);
    });

    it('should reject ingredient without name', () => {
      const ingredient = {
        name: '',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      };

      const result = IngredientSchema.safeParse(ingredient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('name is required');
      }
    });

    it('should reject ingredient with negative quantity', () => {
      const ingredient = {
        name: 'Flour',
        quantity: -2,
        unit: MeasurementUnit.CUP,
      };

      const result = IngredientSchema.safeParse(ingredient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });
  });

  describe('StepSchema', () => {
    it('should validate non-empty step', () => {
      const step = 'Preheat oven to 350°F';
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should reject empty step', () => {
      const step = '';
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should validate long step instruction', () => {
      const longStep = 'In a large bowl, combine flour, sugar, baking powder, and salt. In another bowl, whisk together milk, eggs, and melted butter. Pour wet ingredients into dry ingredients and mix until just combined.';
      const result = StepSchema.safeParse(longStep);
      expect(result.success).toBe(true);
    });
  });

  describe('TagSchema', () => {
    it('should validate valid cuisine tag', () => {
      const tag = 'Italian';
      const result = TagSchema.safeParse(tag);
      expect(result.success).toBe(true);
    });

    it('should validate valid dietary tag', () => {
      const tag = 'Vegetarian';
      const result = TagSchema.safeParse(tag);
      expect(result.success).toBe(true);
    });

    it('should validate valid meal type tag', () => {
      const tag = 'Dinner';
      const result = TagSchema.safeParse(tag);
      expect(result.success).toBe(true);
    });

    it('should validate valid cooking method tag', () => {
      const tag = 'Baking';
      const result = TagSchema.safeParse(tag);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tag', () => {
      const tag = 'InvalidTag';
      const result = TagSchema.safeParse(tag);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('predefined');
      }
    });
  });

  describe('Helper Functions', () => {
    describe('validateRecipeForm', () => {
      it('should return success for valid data', () => {
        const validData = {
          title: 'Test Recipe',
          servings: 4,
          category: DishCategory.DINNER,
          ingredients: [{ name: 'Flour', quantity: null, unit: null }],
          steps: ['Mix ingredients'],
          tags: [],
        };

        const result = validateRecipeForm(validData);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should return errors for invalid data', () => {
        const invalidData = {
          title: '',
          servings: 0,
          ingredients: [],
          steps: [],
        };

        const result = validateRecipeForm(invalidData);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });

    describe('validateIngredient', () => {
      it('should return success for valid ingredient', () => {
        const ingredient = { name: 'Flour', quantity: 2, unit: MeasurementUnit.CUP };
        const result = validateIngredient(ingredient);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should return error for invalid ingredient', () => {
        const ingredient = { name: '', quantity: null, unit: null };
        const result = validateIngredient(ingredient);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('validateStep', () => {
      it('should return success for valid step', () => {
        const step = 'Mix ingredients well';
        const result = validateStep(step);
        expect(result.success).toBe(true);
        expect(result.data).toBe(step);
      });

      it('should return error for empty step', () => {
        const step = '';
        const result = validateStep(step);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('validateTag', () => {
      it('should return success for valid tag', () => {
        const tag = 'Italian';
        const result = validateTag(tag);
        expect(result.success).toBe(true);
        expect(result.data).toBe(tag);
      });

      it('should return error for invalid tag', () => {
        const tag = 'InvalidTag';
        const result = validateTag(tag);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle recipe with maximum allowed values', () => {
      // Using actual constraints: servings max 50, tags max 20
      const maxData = {
        title: 'a'.repeat(200), // Max title length (200)
        servings: 50, // Max servings (50)
        category: DishCategory.DINNER,
        ingredients: Array(20).fill({ name: 'Ingredient', quantity: 1, unit: MeasurementUnit.CUP }),
        steps: Array(20).fill('Step instruction'),
        prepTime: 1440, // Max prep time (24 hours)
        cookTime: 1440, // Max cook time (24 hours)
        tags: ['Italian', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'], // Within max 20
      };

      const result = RecipeFormSchema.safeParse(maxData);
      expect(result.success).toBe(true);
    });

    it('should handle recipe with special characters in title', () => {
      const data = {
        title: 'Mom\'s "Famous" Chocolate Chip Cookies & Brownies!',
        servings: 4,
        category: DishCategory.DESSERT,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix & bake'],
      };

      const result = RecipeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle recipe with decimal quantities', () => {
      const data = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Flour', quantity: 2.5, unit: MeasurementUnit.CUP },
          { name: 'Sugar', quantity: 0.5, unit: MeasurementUnit.CUP },
        ],
        steps: ['Mix ingredients'],
      };

      const result = RecipeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle recipe with multiple tags from different categories', () => {
      const data = {
        title: 'Test Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Flour', quantity: null, unit: null }],
        steps: ['Mix ingredients'],
        tags: ['Italian', 'Vegetarian', 'Dinner', 'Baking'],
      };

      const result = RecipeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

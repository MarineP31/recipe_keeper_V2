/**
 * Task 12.3: End-to-End Tests for Recipe CRUD Operations
 * Tests complete user workflows including edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { recipeService } from '@/lib/db/services/recipe-service';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';
import { DishCategory, MeasurementUnit } from '@/constants/enums';
import {
  RecipeFormSchema,
  validateRecipeForm,
} from '@/lib/validations/recipe-form-schema';

describe('Recipe End-to-End Tests', () => {
  let createdRecipeIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created recipes
    for (const id of createdRecipeIds) {
      try {
        await recipeService.deleteRecipe(id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    createdRecipeIds = [];
  });

  describe('Task 12.3: Recipe Creation with All Fields', () => {
    it('should create and retrieve recipe with all fields populated', async () => {
      // Arrange - Simulate user filling out complete form
      const formData = {
        title: 'Italian Pasta Carbonara',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Spaghetti', quantity: 400, unit: MeasurementUnit.GRAM },
          { name: 'Eggs', quantity: 4, unit: null },
          { name: 'Parmesan cheese', quantity: 100, unit: MeasurementUnit.GRAM },
          { name: 'Pancetta', quantity: 150, unit: MeasurementUnit.GRAM },
          { name: 'Black pepper', quantity: null, unit: null },
        ],
        steps: [
          'Bring a large pot of salted water to boil',
          'Cook spaghetti according to package directions',
          'Beat eggs in a bowl and add grated parmesan',
          'Cook pancetta until crispy',
          'Drain pasta and combine with egg mixture',
          'Add pancetta and season with black pepper',
        ],
        imageUri: 'file:///mock/image/carbonara.jpg',
        prepTime: 15,
        cookTime: 20,
        tags: ['Italian', 'Dinner'],
        source: null,
      };

      // Validate form data
      const validation = validateRecipeForm(formData);
      expect(validation.success).toBe(true);

      // Act - Create recipe
      const recipe = await recipeService.createRecipe(formData as CreateRecipeInput);
      createdRecipeIds.push(recipe.id);

      // Assert - Verify all fields
      expect(recipe.title).toBe('Italian Pasta Carbonara');
      expect(recipe.servings).toBe(4);
      expect(recipe.category).toBe(DishCategory.DINNER);
      expect(recipe.ingredients).toHaveLength(5);
      expect(recipe.steps).toHaveLength(6);
      expect(recipe.imageUri).toBeTruthy();
      expect(recipe.prepTime).toBe(15);
      expect(recipe.cookTime).toBe(20);
      expect(recipe.tags).toContain('Italian');

      // Verify retrieval
      const retrieved = await recipeService.getRecipeById(recipe.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Italian Pasta Carbonara');
    });
  });

  describe('Task 12.3: Recipe Creation with Minimal Fields', () => {
    it('should create and retrieve recipe with only required fields', async () => {
      // Arrange - Simulate user filling minimum fields
      const minimalData = {
        title: 'Simple Scrambled Eggs',
        servings: 1,
        category: DishCategory.BREAKFAST,
        ingredients: [
          { name: 'Eggs', quantity: null, unit: null },
        ],
        steps: [
          'Beat eggs and cook in a pan',
        ],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
        source: null,
      };

      // Validate
      const validation = validateRecipeForm(minimalData);
      expect(validation.success).toBe(true);

      // Act
      const recipe = await recipeService.createRecipe(minimalData as CreateRecipeInput);
      createdRecipeIds.push(recipe.id);

      // Assert
      expect(recipe.title).toBe('Simple Scrambled Eggs');
      expect(recipe.ingredients).toHaveLength(1);
      expect(recipe.steps).toHaveLength(1);
      expect(recipe.imageUri).toBeNull();
      expect(recipe.prepTime).toBeNull();
      expect(recipe.cookTime).toBeNull();
      expect(recipe.tags).toHaveLength(0);
    });
  });

  describe('Task 12.3: Recipe Editing with Image Changes', () => {
    it('should update recipe and change image', async () => {
      // Arrange - Create initial recipe with image
      const initialData: CreateRecipeInput = {
        title: 'Chocolate Cake',
        servings: 8,
        category: DishCategory.DESSERT,
        ingredients: [{ name: 'Chocolate', quantity: 200, unit: MeasurementUnit.GRAM }],
        steps: ['Bake the cake'],
        imageUri: 'file:///mock/image/cake1.jpg',
        prepTime: 30,
        cookTime: 45,
        tags: ['Dessert'],
      };

      const recipe = await recipeService.createRecipe(initialData);
      createdRecipeIds.push(recipe.id);

      // Act - Update with new image
      const updateData: UpdateRecipeInput = {
        id: recipe.id,
        imageUri: 'file:///mock/image/cake2.jpg',
      };

      const updated = await recipeService.updateRecipe(updateData);

      // Assert
      expect(updated.imageUri).toBe('file:///mock/image/cake2.jpg');
      expect(updated.imageUri).not.toBe(initialData.imageUri);

      // Verify in database
      const retrieved = await recipeService.getRecipeById(recipe.id);
      expect(retrieved?.imageUri).toBe('file:///mock/image/cake2.jpg');
    });

    it('should update recipe and remove image', async () => {
      // Arrange - Create recipe with image
      const initialData: CreateRecipeInput = {
        title: 'Salad',
        servings: 2,
        category: DishCategory.LUNCH,
        ingredients: [{ name: 'Lettuce', quantity: null, unit: null }],
        steps: ['Toss salad'],
        imageUri: 'file:///mock/image/salad.jpg',
        prepTime: 5,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(initialData);
      createdRecipeIds.push(recipe.id);

      // Act - Remove image
      const updateData: UpdateRecipeInput = {
        id: recipe.id,
        imageUri: null,
      };

      const updated = await recipeService.updateRecipe(updateData);

      // Assert
      expect(updated.imageUri).toBeNull();
    });
  });

  describe('Task 12.3: Recipe Deletion with Confirmation', () => {
    it('should delete recipe after confirmation', async () => {
      // Arrange - Create recipe
      const recipeData: CreateRecipeInput = {
        title: 'To Be Deleted',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Test step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(recipeData);
      createdRecipeIds.push(recipe.id);

      // Verify recipe exists
      const exists = await recipeService.getRecipeById(recipe.id);
      expect(exists).toBeDefined();

      // Act - Delete (simulating user confirmation)
      await recipeService.deleteRecipe(recipe.id);

      // Assert - Recipe should not exist
      const deleted = await recipeService.getRecipeById(recipe.id);
      expect(deleted).toBeNull();

      // Remove from cleanup list
      createdRecipeIds = createdRecipeIds.filter(id => id !== recipe.id);
    });
  });

  describe('Task 12.3: Form Validation Edge Cases', () => {
    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
    });

    it('should reject title exceeding maximum length', () => {
      const longTitle = 'a'.repeat(201);
      const invalidData = {
        title: longTitle,
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
    });

    it('should reject recipe without ingredients', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.ingredients).toBeDefined();
    });

    it('should reject recipe without steps', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: [],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.steps).toBeDefined();
    });

    it('should reject ingredient with empty name', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: '', quantity: 1, unit: MeasurementUnit.CUP }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty step', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: [''],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid servings (zero)', () => {
      const invalidData = {
        title: 'Test',
        servings: 0,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.servings).toBeDefined();
    });

    it('should reject negative prep time', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        prepTime: -5,
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.prepTime).toBeDefined();
    });

    it('should reject negative cook time', () => {
      const invalidData = {
        title: 'Test',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        cookTime: -10,
      };

      const result = validateRecipeForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.cookTime).toBeDefined();
    });
  });

  describe('Task 12.3: Image Handling Edge Cases', () => {
    it('should handle recipe with valid image URI', async () => {
      const data: CreateRecipeInput = {
        title: 'Recipe with Image',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: 'file:///valid/path/image.jpg',
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(data);
      createdRecipeIds.push(recipe.id);

      expect(recipe.imageUri).toBe('file:///valid/path/image.jpg');
    });

    it('should handle recipe without image', async () => {
      const data: CreateRecipeInput = {
        title: 'Recipe without Image',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(data);
      createdRecipeIds.push(recipe.id);

      expect(recipe.imageUri).toBeNull();
    });
  });

  describe('Task 12.3: Complex Recipe Scenarios', () => {
    it('should handle recipe with special characters in title', async () => {
      const data: CreateRecipeInput = {
        title: 'Mom\'s "Famous" Cookies & Brownies!',
        servings: 12,
        category: DishCategory.DESSERT,
        ingredients: [{ name: 'Chocolate chips', quantity: 2, unit: MeasurementUnit.CUP }],
        steps: ['Mix and bake'],
        imageUri: null,
        prepTime: 15,
        cookTime: 25,
        tags: ['Dessert'],
      };

      const recipe = await recipeService.createRecipe(data);
      createdRecipeIds.push(recipe.id);

      expect(recipe.title).toBe('Mom\'s "Famous" Cookies & Brownies!');
    });

    it('should handle recipe with fractional quantities', async () => {
      const data: CreateRecipeInput = {
        title: 'Precision Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [
          { name: 'Flour', quantity: 2.5, unit: MeasurementUnit.CUP },
          { name: 'Sugar', quantity: 0.75, unit: MeasurementUnit.CUP },
        ],
        steps: ['Combine ingredients'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: [],
      };

      const recipe = await recipeService.createRecipe(data);
      createdRecipeIds.push(recipe.id);

      expect(recipe.ingredients[0].quantity).toBe(2.5);
      expect(recipe.ingredients[1].quantity).toBe(0.75);
    });

    it('should handle recipe with many tags from different categories', async () => {
      const data: CreateRecipeInput = {
        title: 'Multi-Category Recipe',
        servings: 4,
        category: DishCategory.DINNER,
        ingredients: [{ name: 'Test', quantity: null, unit: null }],
        steps: ['Step'],
        imageUri: null,
        prepTime: null,
        cookTime: null,
        tags: ['Italian', 'Vegetarian', 'Dinner', 'Baking', 'Gluten-Free'],
      };

      const recipe = await recipeService.createRecipe(data);
      createdRecipeIds.push(recipe.id);

      expect(recipe.tags).toHaveLength(5);
      expect(recipe.tags).toContain('Italian');
      expect(recipe.tags).toContain('Vegetarian');
      expect(recipe.tags).toContain('Gluten-Free');
    });
  });
});

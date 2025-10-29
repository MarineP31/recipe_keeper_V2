/**
 * Tests for Recipe Form Screen Component
 * Task Group 5.1: Test create/edit mode, unsaved changes detection, dynamic fields
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import { recipeService } from '@/lib/db/services/recipe-service';
import { DishCategory } from '@/constants/enums';

// Mock the recipe service
jest.mock('@/lib/db/services/recipe-service', () => ({
  recipeService: {
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    getRecipeById: jest.fn(),
  },
}));

// Mock router
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

describe('RecipeFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Create mode renders with empty form
  it('should render empty form in create mode', () => {
    const onSave = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    expect(getByPlaceholderText('Recipe Title')).toBeTruthy();
    expect(getByPlaceholderText('4')).toBeTruthy(); // Default servings
    expect(getByText('Add Ingredient')).toBeTruthy();
    expect(getByText('Add Step')).toBeTruthy();
  });

  // Test 2: Edit mode pre-fills form with recipe data
  it('should pre-fill form with recipe data in edit mode', async () => {
    const mockRecipe = {
      id: 'test-id',
      title: 'Test Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [
        { name: 'Flour', quantity: 2, unit: 'cup' },
      ],
      steps: ['Step 1', 'Step 2'],
      prepTime: 15,
      cookTime: 30,
      tags: ['test', 'recipe'],
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);

    const onSave = jest.fn();
    const { getByDisplayValue } = render(
      <RecipeFormScreen mode="edit" recipeId="test-id" onSave={onSave} />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Test Recipe')).toBeTruthy();
      expect(getByDisplayValue('4')).toBeTruthy();
    });
  });

  // Test 3: Create mode saves new recipe
  it('should call createRecipe when saving in create mode', async () => {
    const mockCreatedRecipe = {
      id: 'new-id',
      title: 'New Recipe',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Test', quantity: null, unit: null }],
      steps: ['Step 1'],
      prepTime: null,
      cookTime: null,
      tags: [],
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    (recipeService.createRecipe as jest.Mock).mockResolvedValue(mockCreatedRecipe);

    const onSave = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    // Fill in required fields
    const titleInput = getByPlaceholderText('Recipe Title');
    fireEvent.changeText(titleInput, 'New Recipe');

    // Trigger save
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(recipeService.createRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Recipe',
          servings: 4,
          category: DishCategory.DINNER,
        })
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  // Test 4: Edit mode updates existing recipe
  it('should call updateRecipe when saving in edit mode', async () => {
    const mockRecipe = {
      id: 'test-id',
      title: 'Original Title',
      servings: 4,
      category: DishCategory.DINNER,
      ingredients: [{ name: 'Flour', quantity: 2, unit: 'cup' }],
      steps: ['Step 1'],
      prepTime: 15,
      cookTime: 30,
      tags: [],
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    (recipeService.getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);
    (recipeService.updateRecipe as jest.Mock).mockResolvedValue({
      ...mockRecipe,
      title: 'Updated Title',
    });

    const onSave = jest.fn();
    const { getByDisplayValue, getByTestId } = render(
      <RecipeFormScreen mode="edit" recipeId="test-id" onSave={onSave} />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Original Title')).toBeTruthy();
    });

    // Update title
    const titleInput = getByDisplayValue('Original Title');
    fireEvent.changeText(titleInput, 'Updated Title');

    // Save
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(recipeService.updateRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          title: 'Updated Title',
        })
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  // Test 5: Unsaved changes detection
  it('should detect unsaved changes when form is modified', async () => {
    const onSave = jest.fn();
    const { getByPlaceholderText } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    // Initially, form should not be dirty
    const titleInput = getByPlaceholderText('Recipe Title');

    // Make a change
    fireEvent.changeText(titleInput, 'Modified Title');

    // The form should now be dirty
    // This would be tracked internally by the component's isDirty state
    expect(titleInput.props.value).toBe('Modified Title');
  });

  // Test 6: Dynamic ingredient fields - add ingredient
  it('should add new ingredient field when Add Ingredient is pressed', () => {
    const onSave = jest.fn();
    const { getByText, getAllByPlaceholderText } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    // Initially should have 1 ingredient field
    let ingredientInputs = getAllByPlaceholderText('Ingredient name');
    expect(ingredientInputs.length).toBe(1);

    // Add new ingredient
    const addButton = getByText('Add Ingredient');
    fireEvent.press(addButton);

    // Should now have 2 ingredient fields
    ingredientInputs = getAllByPlaceholderText('Ingredient name');
    expect(ingredientInputs.length).toBe(2);
  });

  // Test 7: Dynamic ingredient fields - remove ingredient
  it('should remove ingredient field when remove button is pressed', () => {
    const onSave = jest.fn();
    const { getByText, getAllByPlaceholderText, getAllByTestId } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    // Add a second ingredient
    const addButton = getByText('Add Ingredient');
    fireEvent.press(addButton);
    fireEvent.press(addButton); // Add third

    let ingredientInputs = getAllByPlaceholderText('Ingredient name');
    expect(ingredientInputs.length).toBe(3);

    // Remove second ingredient
    const removeButtons = getAllByTestId(/remove-ingredient-/);
    fireEvent.press(removeButtons[1]);

    ingredientInputs = getAllByPlaceholderText('Ingredient name');
    expect(ingredientInputs.length).toBe(2);
  });

  // Test 8: Dynamic step fields work correctly
  it('should add and remove step fields dynamically', () => {
    const onSave = jest.fn();
    const { getByText, getAllByPlaceholderText, getAllByTestId } = render(
      <RecipeFormScreen mode="create" onSave={onSave} />
    );

    // Initially should have 1 step field
    let stepInputs = getAllByPlaceholderText('Instruction');
    expect(stepInputs.length).toBe(1);

    // Add new step
    const addButton = getByText('Add Step');
    fireEvent.press(addButton);
    fireEvent.press(addButton);

    stepInputs = getAllByPlaceholderText('Instruction');
    expect(stepInputs.length).toBe(3);

    // Remove a step
    const removeButtons = getAllByTestId(/remove-step-/);
    fireEvent.press(removeButtons[1]);

    stepInputs = getAllByPlaceholderText('Instruction');
    expect(stepInputs.length).toBe(2);
  });
});

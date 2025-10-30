/**
 * Recipe Create Screen
 * Task 7.1: Create Operation with proper navigation to recipe detail
 */

import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function RecipeCreateScreen() {
  const router = useRouter();

  const handleSave = (recipe: Recipe) => {
    // Task 7.1: Navigate to recipe detail view after successful creation
    if (recipe.id) {
      router.replace(`/recipe/${recipe.id}`);
    } else {
      // Fallback if recipe ID is not available
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Recipe',
          headerBackTitle: 'Cancel',
        }}
      />
      <RecipeFormScreen mode="create" onSave={handleSave} />
    </>
  );
}

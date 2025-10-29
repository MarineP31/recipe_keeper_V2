/**
 * Recipe Create Screen
 * Task Group 5.8: Form for creating a new recipe
 */

import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function RecipeCreateScreen() {
  const router = useRouter();

  const handleSave = (recipe: Recipe) => {
    // Navigate back to previous screen after successful save
    router.back();
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

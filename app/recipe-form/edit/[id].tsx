/**
 * Recipe Edit Screen
 * Task Group 5.9: Form for editing an existing recipe
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecipeFormScreen } from '@/components/recipes/RecipeFormScreen';
import { validateRecipeParams } from '@/lib/navigation/helpers';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function RecipeEditScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Validate route parameters
  if (!validateRecipeParams(params)) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen
          options={{
            title: 'Edit Recipe',
            headerBackTitle: 'Cancel',
          }}
        />
        <Text style={styles.errorText}>Invalid recipe ID</Text>
      </View>
    );
  }

  const { id } = params;

  const handleSave = (recipe: Recipe) => {
    // Navigate back to recipe detail screen after successful save
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Recipe',
          headerBackTitle: 'Cancel',
        }}
      />
      <RecipeFormScreen mode="edit" recipeId={id} onSave={handleSave} />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});

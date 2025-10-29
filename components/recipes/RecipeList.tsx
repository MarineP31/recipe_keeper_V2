/**
 * RecipeList component
 * Displays recipes in a vertical list layout
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/db';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListEmptyComponent?: React.ReactElement;
  testID?: string;
}

/**
 * List layout component for recipes
 *
 * @param props - Component props
 * @returns RecipeList component
 *
 * @example
 * ```tsx
 * <RecipeList
 *   recipes={filteredRecipes}
 *   onRecipePress={handleRecipePress}
 *   onEndReached={loadMore}
 *   onRefresh={refresh}
 *   refreshing={loading}
 * />
 * ```
 */
export function RecipeList({
  recipes,
  onRecipePress,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListEmptyComponent,
  testID = 'recipe-list',
}: RecipeListProps) {
  const renderItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={onRecipePress}
      variant="list"
      testID={`${testID}-card-${item.id}`}
    />
  );

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={ListEmptyComponent}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingBottom: 100, // Space for FAB
  },
});

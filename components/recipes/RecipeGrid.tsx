/**
 * RecipeGrid component
 * Displays recipes in a grid layout with 2 columns
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/lib/db';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListEmptyComponent?: React.ReactElement;
  testID?: string;
}

/**
 * Grid layout component for recipes with 2 columns
 *
 * @param props - Component props
 * @returns RecipeGrid component
 *
 * @example
 * ```tsx
 * <RecipeGrid
 *   recipes={filteredRecipes}
 *   onRecipePress={handleRecipePress}
 *   onEndReached={loadMore}
 *   onRefresh={refresh}
 *   refreshing={loading}
 * />
 * ```
 */
export function RecipeGrid({
  recipes,
  onRecipePress,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListEmptyComponent,
  testID = 'recipe-grid',
}: RecipeGridProps) {
  const renderItem = ({ item }: { item: Recipe }) => (
    <View style={styles.gridItem}>
      <RecipeCard
        recipe={item}
        onPress={onRecipePress}
        variant="grid"
        testID={`${testID}-card-${item.id}`}
      />
    </View>
  );

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.columnWrapper}
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
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  columnWrapper: {
    gap: 16,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
});

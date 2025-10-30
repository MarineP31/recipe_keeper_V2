/**
 * RecipeRepositoryScreen component
 * Main screen for browsing, searching, and filtering recipes
 * Task 8.2 & 8.3: FAB Integration and Navigation Flows
 */

import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/ui/SearchBar';
import { TagFilter } from '@/components/ui/TagFilter';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { RecipeGrid } from './RecipeGrid';
import { RecipeList } from './RecipeList';
import { useRecipes } from '@/lib/hooks/useRecipes';
import type { Recipe } from '@/lib/db';

/**
 * Recipe Repository Screen - Main browsing interface
 *
 * Features:
 * - Search recipes by name or ingredients
 * - Filter by tags with counts
 * - Toggle between grid and list view
 * - Pull-to-refresh
 * - Infinite scroll pagination
 * - FAB for adding new recipes
 * - Navigation to recipe detail and create screens
 *
 * @returns RecipeRepositoryScreen component
 *
 * @example
 * ```tsx
 * // In app/(tabs)/index.tsx
 * export { RecipeRepositoryScreen as default } from '@/components/recipes/RecipeRepositoryScreen';
 * ```
 */
export function RecipeRepositoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    recipes,
    filteredRecipes,
    loading,
    error,
    searchQuery,
    selectedTags,
    viewMode,
    // hasMore, // TODO: Use for pagination indicator
    setSearchQuery,
    toggleTag,
    clearFilters,
    setViewMode,
    loadMore,
    refresh,
  } = useRecipes({
    initialPageSize: 20,
    enablePersistence: true,
  });

  const backgroundColor = isDark ? '#000000' : '#F2F2F7';

  /**
   * Task 8.3: Handle recipe card press - navigate to detail screen (Read flow)
   */
  const handleRecipePress = useCallback((recipe: Recipe) => {
    try {
      if (!recipe.id) {
        console.error('Recipe missing ID:', recipe);
        return;
      }
      router.push(`/recipe/${recipe.id}` as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Gracefully handle navigation error - could show toast notification
    }
  }, [router]);

  /**
   * Task 8.2 & 8.3: Handle FAB press - navigate to create screen (Create flow)
   */
  const handleAddRecipe = useCallback(() => {
    try {
      router.push('/recipe-form/create' as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Gracefully handle navigation error
    }
  }, [router]);

  /**
   * Render header with search, filters, and view toggle
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes or ingredients..."
          />
        </View>
        <ViewModeToggle
          viewMode={viewMode}
          onToggle={setViewMode}
        />
      </View>

      {recipes.length > 0 && (
        <TagFilter
          recipes={recipes}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
        />
      )}
    </View>
  );

  /**
   * Render empty state based on context
   */
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          message={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      );
    }

    if (recipes.length === 0) {
      return (
        <EmptyState
          icon="restaurant-outline"
          title="No recipes yet"
          message="Start building your recipe collection by adding your first recipe"
          actionLabel="Add Recipe"
          onAction={handleAddRecipe}
        />
      );
    }

    if (filteredRecipes.length === 0) {
      const hasFilters = searchQuery.length > 0 || selectedTags.length > 0;

      if (hasFilters) {
        return (
          <EmptyState
            icon="search-outline"
            title="No recipes found"
            message="Try adjusting your search or filters"
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        );
      }
    }

    return null;
  };

  /**
   * Render loading indicator
   */
  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {renderHeader()}

      <View style={styles.content}>
        {viewMode === 'grid' ? (
          <RecipeGrid
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        ) : (
          <RecipeList
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onEndReached={loadMore}
            onRefresh={refresh}
            refreshing={loading}
            ListEmptyComponent={renderEmptyState() || undefined}
          />
        )}
      </View>

      <FAB
        icon="add"
        onPress={handleAddRecipe}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

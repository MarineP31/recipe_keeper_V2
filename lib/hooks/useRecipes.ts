/**
 * Custom hook for managing recipe data and operations
 * Handles loading, searching, filtering, and pagination of recipes
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService } from '@/lib/db';
import type { Recipe } from '@/lib/db';

export type ViewMode = 'grid' | 'list';

interface UseRecipesOptions {
  initialPageSize?: number;
  enablePersistence?: boolean;
}

interface UseRecipesReturn {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
  viewMode: ViewMode;
  page: number;
  hasMore: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const STORAGE_KEYS = {
  VIEW_MODE: '@recipe_keeper:view_mode',
  SELECTED_TAGS: '@recipe_keeper:selected_tags',
};

/**
 * Hook for managing recipe repository state and operations
 *
 * @param options - Configuration options
 * @returns Recipe data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   recipes,
 *   filteredRecipes,
 *   loading,
 *   searchQuery,
 *   setSearchQuery,
 *   viewMode,
 *   setViewMode
 * } = useRecipes({ initialPageSize: 20 });
 * ```
 */
export function useRecipes(options: UseRecipesOptions = {}): UseRecipesReturn {
  const {
    initialPageSize = 20,
    enablePersistence = true,
  } = options;

  // State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Load persisted preferences from AsyncStorage
   */
  const loadPreferences = useCallback(async () => {
    if (!enablePersistence) return;

    try {
      const [storedViewMode, storedTags] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VIEW_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TAGS),
      ]);

      if (storedViewMode === 'grid' || storedViewMode === 'list') {
        setViewMode(storedViewMode);
      }

      if (storedTags) {
        setSelectedTags(JSON.parse(storedTags));
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [enablePersistence]);

  /**
   * Persist view mode preference
   */
  const persistViewMode = useCallback(async (mode: ViewMode) => {
    if (!enablePersistence) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (err) {
      console.error('Failed to persist view mode:', err);
    }
  }, [enablePersistence]);

  /**
   * Persist selected tags
   */
  const persistTags = useCallback(async (tags: string[]) => {
    if (!enablePersistence) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TAGS, JSON.stringify(tags));
    } catch (err) {
      console.error('Failed to persist tags:', err);
    }
  }, [enablePersistence]);

  /**
   * Load initial recipes from database
   */
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allRecipes = await recipeService.getAllRecipes();
      setRecipes(allRecipes);
      setHasMore(allRecipes.length >= initialPageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [initialPageSize]);

  /**
   * Filter recipes based on search query and selected tags
   */
  const filteredRecipes = recipes.filter((recipe) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(query);
      const matchesIngredients = recipe.ingredients.some(
        (ing) => ing.name.toLowerCase().includes(query)
      );

      if (!matchesTitle && !matchesIngredients) {
        return false;
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const recipeTags = recipe.tags.map(tag => tag.toLowerCase());
      const hasAllTags = selectedTags.every(
        selectedTag => recipeTags.includes(selectedTag.toLowerCase())
      );

      if (!hasAllTags) {
        return false;
      }
    }

    return true;
  });

  /**
   * Toggle a tag in the selected tags list
   */
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((current) => {
      const newTags = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];

      persistTags(newTags);
      return newTags;
    });
  }, [persistTags]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    persistTags([]);
  }, [persistTags]);

  /**
   * Update view mode
   */
  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    persistViewMode(mode);
  }, [persistViewMode]);

  /**
   * Load more recipes (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setPage((current) => current + 1);
      // For now, we load all recipes at once
      // In the future, this could be optimized with actual pagination
    } catch (err) {
      console.error('Failed to load more recipes:', err);
    }
  }, [hasMore, loading]);

  /**
   * Refresh recipes from database
   */
  const refresh = useCallback(async () => {
    setPage(1);
    await loadRecipes();
  }, [loadRecipes]);

  // Load preferences and recipes on mount
  useEffect(() => {
    loadPreferences();
    loadRecipes();
  }, [loadPreferences, loadRecipes]);

  return {
    recipes,
    filteredRecipes,
    loading,
    error,
    searchQuery,
    selectedTags,
    viewMode,
    page,
    hasMore,
    setSearchQuery,
    toggleTag,
    clearFilters,
    setViewMode: handleSetViewMode,
    loadMore,
    refresh,
  };
}

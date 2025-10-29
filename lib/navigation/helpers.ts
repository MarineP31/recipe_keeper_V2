/**
 * Navigation Helper Functions
 * Utilities for route construction and navigation parameter handling
 */

/**
 * Recipe route parameter type
 */
export interface RecipeRouteParams {
  id: string;
}

/**
 * Validates a recipe ID parameter
 * @param id - The recipe ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidRecipeId(id: string | undefined | null): id is string {
  return typeof id === 'string' && id.length > 0;
}

/**
 * Constructs a recipe detail route path
 * @param id - The recipe ID
 * @returns The route path string
 */
export function getRecipeDetailRoute(id: string): string {
  if (!isValidRecipeId(id)) {
    throw new Error('Invalid recipe ID');
  }
  return `/recipe/${id}`;
}

/**
 * Constructs a recipe edit route path
 * @param id - The recipe ID
 * @returns The route path string
 */
export function getRecipeEditRoute(id: string): string {
  if (!isValidRecipeId(id)) {
    throw new Error('Invalid recipe ID');
  }
  return `/recipe-form/edit/${id}`;
}

/**
 * Constructs a recipe create route path
 * @returns The route path string
 */
export function getRecipeCreateRoute(): string {
  return '/recipe-form/create';
}

/**
 * Validates route parameters for recipe detail/edit screens
 * @param params - The route parameters object
 * @returns True if params contain a valid ID
 */
export function validateRecipeParams(params: unknown): params is RecipeRouteParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'id' in params &&
    isValidRecipeId((params as RecipeRouteParams).id)
  );
}

/**
 * Navigation utilities for cross-tab navigation
 */
export const NavigationUtils = {
  /**
   * Check if a route is a tab route
   */
  isTabRoute(route: string): boolean {
    const tabRoutes = ['/', '/add-recipe', '/shopping-list', '/meal-plan'];
    return tabRoutes.includes(route);
  },

  /**
   * Get the parent tab for a given route
   */
  getParentTab(route: string): string {
    // Check recipe-form routes first (more specific)
    if (route.startsWith('/recipe-form')) {
      return '/add-recipe'; // Add Recipe tab
    }
    // Then check recipe detail routes
    if (route.startsWith('/recipe')) {
      return '/'; // Home tab
    }
    return '/'; // Default to Home
  },
};

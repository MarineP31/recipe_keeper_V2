/**
 * Navigation Helpers Tests
 * Tests for route construction and parameter validation utilities
 */

import {
  isValidRecipeId,
  getRecipeDetailRoute,
  getRecipeEditRoute,
  getRecipeCreateRoute,
  validateRecipeParams,
  NavigationUtils,
} from '@/lib/navigation/helpers';

describe('Navigation Helpers', () => {
  describe('isValidRecipeId', () => {
    it('should return true for valid recipe IDs', () => {
      expect(isValidRecipeId('123')).toBe(true);
      expect(isValidRecipeId('abc-def-ghi')).toBe(true);
      expect(isValidRecipeId('recipe-1')).toBe(true);
    });

    it('should return false for invalid recipe IDs', () => {
      expect(isValidRecipeId('')).toBe(false);
      expect(isValidRecipeId(undefined)).toBe(false);
      expect(isValidRecipeId(null)).toBe(false);
    });
  });

  describe('getRecipeDetailRoute', () => {
    it('should construct correct recipe detail route', () => {
      expect(getRecipeDetailRoute('123')).toBe('/recipe/123');
      expect(getRecipeDetailRoute('abc-def')).toBe('/recipe/abc-def');
    });

    it('should throw error for invalid recipe ID', () => {
      expect(() => getRecipeDetailRoute('')).toThrow('Invalid recipe ID');
    });
  });

  describe('getRecipeEditRoute', () => {
    it('should construct correct recipe edit route', () => {
      expect(getRecipeEditRoute('123')).toBe('/recipe-form/edit/123');
      expect(getRecipeEditRoute('abc-def')).toBe('/recipe-form/edit/abc-def');
    });

    it('should throw error for invalid recipe ID', () => {
      expect(() => getRecipeEditRoute('')).toThrow('Invalid recipe ID');
    });
  });

  describe('getRecipeCreateRoute', () => {
    it('should return correct recipe create route', () => {
      expect(getRecipeCreateRoute()).toBe('/recipe-form/create');
    });
  });

  describe('validateRecipeParams', () => {
    it('should validate correct recipe params', () => {
      expect(validateRecipeParams({ id: '123' })).toBe(true);
      expect(validateRecipeParams({ id: 'abc-def' })).toBe(true);
    });

    it('should reject invalid recipe params', () => {
      expect(validateRecipeParams({ id: '' })).toBe(false);
      expect(validateRecipeParams({})).toBe(false);
      expect(validateRecipeParams(null)).toBe(false);
      expect(validateRecipeParams(undefined)).toBe(false);
      expect(validateRecipeParams('not an object')).toBe(false);
    });
  });

  describe('NavigationUtils', () => {
    describe('isTabRoute', () => {
      it('should identify tab routes correctly', () => {
        expect(NavigationUtils.isTabRoute('/')).toBe(true);
        expect(NavigationUtils.isTabRoute('/add-recipe')).toBe(true);
        expect(NavigationUtils.isTabRoute('/shopping-list')).toBe(true);
        expect(NavigationUtils.isTabRoute('/meal-plan')).toBe(true);
      });

      it('should return false for non-tab routes', () => {
        expect(NavigationUtils.isTabRoute('/recipe/123')).toBe(false);
        expect(NavigationUtils.isTabRoute('/recipe-form/create')).toBe(false);
        expect(NavigationUtils.isTabRoute('/recipe-form/edit/123')).toBe(false);
      });
    });

    describe('getParentTab', () => {
      it('should return home tab for recipe routes', () => {
        expect(NavigationUtils.getParentTab('/recipe/123')).toBe('/');
      });

      it('should return add-recipe tab for recipe-form routes', () => {
        expect(NavigationUtils.getParentTab('/recipe-form/create')).toBe('/add-recipe');
        expect(NavigationUtils.getParentTab('/recipe-form/edit/123')).toBe('/add-recipe');
      });

      it('should default to home tab for unknown routes', () => {
        expect(NavigationUtils.getParentTab('/unknown')).toBe('/');
      });
    });
  });
});

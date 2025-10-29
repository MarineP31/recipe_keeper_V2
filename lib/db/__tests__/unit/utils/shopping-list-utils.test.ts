import { ShoppingListItemUtils } from '@/lib/db/schema/shopping-list';
import { MeasurementUnit } from '@/constants/enums';
import type { ShoppingListItem } from '@/lib/db/schema/shopping-list';

describe('ShoppingListItemUtils', () => {
  const mockItem: ShoppingListItem = {
    id: 'test-id',
    name: 'Milk',
    quantity: 2,
    unit: MeasurementUnit.LITER,
    checked: false,
    recipeId: 'recipe-123',
    mealPlanId: 'meal-plan-123',
    createdAt: '2025-10-27T12:00:00.000Z',
  };

  describe('validate', () => {
    it('should return no errors for valid item', () => {
      const errors = ShoppingListItemUtils.validate(mockItem);
      expect(errors).toHaveLength(0);
    });

    it('should detect empty name', () => {
      const invalid = { ...mockItem, name: '' };
      const errors = ShoppingListItemUtils.validate(invalid);
      expect(errors).toContain('Item name is required');
    });

    it('should detect name too long', () => {
      const invalid = { ...mockItem, name: 'A'.repeat(101) };
      const errors = ShoppingListItemUtils.validate(invalid);
      expect(errors.some((e) => e.includes('100 characters'))).toBe(true);
    });

    it('should detect invalid quantity', () => {
      const invalid = { ...mockItem, quantity: -1 };
      const errors = ShoppingListItemUtils.validate(invalid);
      expect(errors.some((e) => e.includes('between 0 and 1000'))).toBe(true);
    });

    it('should accept null quantity and unit', () => {
      const validItem = { ...mockItem, quantity: null, unit: null };
      const errors = ShoppingListItemUtils.validate(validItem);
      expect(errors).toHaveLength(0);
    });
  });

  describe('isFromRecipe', () => {
    it('should return true if item has recipeId', () => {
      expect(ShoppingListItemUtils.isFromRecipe(mockItem)).toBe(true);
    });

    it('should return false if item has no recipeId', () => {
      const manual = { ...mockItem, recipeId: null };
      expect(ShoppingListItemUtils.isFromRecipe(manual)).toBe(false);
    });
  });

  describe('isManual', () => {
    it('should return false if item has recipeId', () => {
      expect(ShoppingListItemUtils.isManual(mockItem)).toBe(false);
    });

    it('should return true if item has no recipeId', () => {
      const manual = { ...mockItem, recipeId: null };
      expect(ShoppingListItemUtils.isManual(manual)).toBe(true);
    });
  });

  describe('toggleChecked', () => {
    it('should toggle checked state', () => {
      const unchecked = { ...mockItem, checked: false };
      const toggled = ShoppingListItemUtils.toggleChecked(unchecked);
      expect(toggled.checked).toBe(true);

      const toggledBack = ShoppingListItemUtils.toggleChecked(toggled);
      expect(toggledBack.checked).toBe(false);
    });
  });

  describe('formatQuantity', () => {
    it('should format item with quantity and unit', () => {
      const formatted = ShoppingListItemUtils.formatQuantity(mockItem);
      expect(formatted).toBe('2 l Milk');
    });

    it('should format item with quantity only', () => {
      const item = { ...mockItem, unit: null };
      const formatted = ShoppingListItemUtils.formatQuantity(item);
      expect(formatted).toBe('2 Milk');
    });

    it('should format item with unit only', () => {
      const item = { ...mockItem, quantity: null };
      const formatted = ShoppingListItemUtils.formatQuantity(item);
      expect(formatted).toBe('Milk (l)');
    });

    it('should format item without quantity or unit', () => {
      const item = { ...mockItem, quantity: null, unit: null };
      const formatted = ShoppingListItemUtils.formatQuantity(item);
      expect(formatted).toBe('Milk');
    });
  });

  describe('groupByCheckedStatus', () => {
    it('should group items by checked status', () => {
      const items = [
        { ...mockItem, id: '1', checked: true },
        { ...mockItem, id: '2', checked: false },
        { ...mockItem, id: '3', checked: false },
        { ...mockItem, id: '4', checked: true },
      ];

      const grouped = ShoppingListItemUtils.groupByCheckedStatus(items);

      expect(grouped.checked).toHaveLength(2);
      expect(grouped.unchecked).toHaveLength(2);
    });
  });

  describe('getCheckedCount and getUncheckedCount', () => {
    const items = [
      { ...mockItem, id: '1', checked: true },
      { ...mockItem, id: '2', checked: false },
      { ...mockItem, id: '3', checked: true },
    ];

    it('should count checked items', () => {
      expect(ShoppingListItemUtils.getCheckedCount(items)).toBe(2);
    });

    it('should count unchecked items', () => {
      expect(ShoppingListItemUtils.getUncheckedCount(items)).toBe(1);
    });
  });

  describe('areAllChecked', () => {
    it('should return true if all items are checked', () => {
      const items = [
        { ...mockItem, id: '1', checked: true },
        { ...mockItem, id: '2', checked: true },
      ];
      expect(ShoppingListItemUtils.areAllChecked(items)).toBe(true);
    });

    it('should return false if some items are unchecked', () => {
      const items = [
        { ...mockItem, id: '1', checked: true },
        { ...mockItem, id: '2', checked: false },
      ];
      expect(ShoppingListItemUtils.areAllChecked(items)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(ShoppingListItemUtils.areAllChecked([])).toBe(false);
    });
  });

  describe('toRow and fromRow', () => {
    it('should convert ShoppingListItem to Row and back', () => {
      const row = ShoppingListItemUtils.toRow(mockItem);
      expect(row.checked).toBe(0); // false = 0

      const item = ShoppingListItemUtils.fromRow(row);
      expect(item).toEqual(mockItem);
    });

    it('should handle checked state correctly', () => {
      const checkedItem = { ...mockItem, checked: true };
      const row = ShoppingListItemUtils.toRow(checkedItem);
      expect(row.checked).toBe(1); // true = 1

      const item = ShoppingListItemUtils.fromRow(row);
      expect(item.checked).toBe(true);
    });
  });
});

import { MealPlanUtils } from '@/lib/db/schema/meal-plan';
import { MealType } from '@/constants/enums';
import type { MealPlan } from '@/lib/db/schema/meal-plan';

describe('MealPlanUtils', () => {
  const mockMealPlan: MealPlan = {
    id: 'test-id',
    recipeId: 'recipe-123',
    date: '2025-10-28',
    mealType: MealType.DINNER,
    createdAt: '2025-10-27T12:00:00.000Z',
  };

  describe('validate', () => {
    it('should return no errors for valid meal plan', () => {
      const errors = MealPlanUtils.validate(mockMealPlan);
      expect(errors).toHaveLength(0);
    });

    it('should detect empty recipeId', () => {
      const invalid = { ...mockMealPlan, recipeId: '' };
      const errors = MealPlanUtils.validate(invalid);
      expect(errors).toContain('Recipe ID is required');
    });

    it('should detect invalid date format', () => {
      const invalid = { ...mockMealPlan, date: '10/28/2025' };
      const errors = MealPlanUtils.validate(invalid);
      expect(errors.some((e) => e.includes('Valid date is required'))).toBe(true);
    });

    it('should detect invalid meal type', () => {
      const invalid = { ...mockMealPlan, mealType: 'brunch' as any };
      const errors = MealPlanUtils.validate(invalid);
      expect(errors.some((e) => e.includes('Valid meal type is required'))).toBe(true);
    });
  });

  describe('isValidDate', () => {
    it('should accept valid ISO date', () => {
      expect(MealPlanUtils.isValidDate('2025-10-28')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(MealPlanUtils.isValidDate('10/28/2025')).toBe(false);
      expect(MealPlanUtils.isValidDate('2025-13-01')).toBe(false);
      expect(MealPlanUtils.isValidDate('not-a-date')).toBe(false);
    });
  });

  describe('isValidMealType', () => {
    it('should accept valid meal types', () => {
      expect(MealPlanUtils.isValidMealType(MealType.BREAKFAST)).toBe(true);
      expect(MealPlanUtils.isValidMealType(MealType.LUNCH)).toBe(true);
      expect(MealPlanUtils.isValidMealType(MealType.DINNER)).toBe(true);
      expect(MealPlanUtils.isValidMealType(MealType.SNACK)).toBe(true);
    });

    it('should reject invalid meal types', () => {
      expect(MealPlanUtils.isValidMealType('brunch' as any)).toBe(false);
      expect(MealPlanUtils.isValidMealType('elevenses' as any)).toBe(false);
    });
  });

  describe('groupByDate', () => {
    it('should group meal plans by date', () => {
      const mealPlans = [
        { ...mockMealPlan, id: '1', date: '2025-10-28', mealType: MealType.BREAKFAST },
        { ...mockMealPlan, id: '2', date: '2025-10-28', mealType: MealType.LUNCH },
        { ...mockMealPlan, id: '3', date: '2025-10-29', mealType: MealType.DINNER },
      ];

      const grouped = MealPlanUtils.groupByDate(mealPlans);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['2025-10-28']).toHaveLength(2);
      expect(grouped['2025-10-29']).toHaveLength(1);
    });
  });

  describe('groupByMealType', () => {
    it('should group meal plans by meal type', () => {
      const mealPlans = [
        { ...mockMealPlan, id: '1', mealType: MealType.BREAKFAST },
        { ...mockMealPlan, id: '2', mealType: MealType.BREAKFAST },
        { ...mockMealPlan, id: '3', mealType: MealType.DINNER },
      ];

      const grouped = MealPlanUtils.groupByMealType(mealPlans);

      expect(grouped[MealType.BREAKFAST]).toHaveLength(2);
      expect(grouped[MealType.DINNER]).toHaveLength(1);
    });
  });

  describe('isMealSlotAvailable', () => {
    it('should return true if slot is available', () => {
      const mealPlans = [
        { ...mockMealPlan, date: '2025-10-28', mealType: MealType.BREAKFAST },
      ];

      expect(
        MealPlanUtils.isMealSlotAvailable(mealPlans, '2025-10-28', MealType.LUNCH)
      ).toBe(true);
    });

    it('should return false if slot is taken', () => {
      const mealPlans = [
        { ...mockMealPlan, date: '2025-10-28', mealType: MealType.BREAKFAST },
      ];

      expect(
        MealPlanUtils.isMealSlotAvailable(mealPlans, '2025-10-28', MealType.BREAKFAST)
      ).toBe(false);
    });
  });

  describe('toRow and fromRow', () => {
    it('should convert MealPlan to MealPlanRow and back', () => {
      const row = MealPlanUtils.toRow(mockMealPlan);
      expect(row.mealType).toBe(mockMealPlan.mealType);

      const mealPlan = MealPlanUtils.fromRow(row);
      expect(mealPlan).toEqual(mockMealPlan);
    });
  });
});

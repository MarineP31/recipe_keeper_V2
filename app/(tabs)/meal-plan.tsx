/**
 * Meal Plan Screen
 * Placeholder screen for meal planning feature
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';

export default function MealPlanScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="calendar-outline"
        title="Coming Soon"
        message="The meal planning feature will be available soon. Stay tuned!"
        testID="meal-plan-empty-state"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

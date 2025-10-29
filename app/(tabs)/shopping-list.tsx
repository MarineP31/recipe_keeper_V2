/**
 * Shopping List Screen
 * Placeholder screen for shopping list feature
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';

export default function ShoppingListScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="cart-outline"
        title="Coming Soon"
        message="The shopping list feature will be available soon. Stay tuned!"
        testID="shopping-list-empty-state"
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

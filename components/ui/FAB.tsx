/**
 * FAB (Floating Action Button) component
 * Displays a floating action button for primary actions
 */

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FABProps {
  icon?: string;
  onPress: () => void;
  testID?: string;
}

/**
 * Floating Action Button component
 *
 * @param props - Component props
 * @returns FAB component
 *
 * @example
 * ```tsx
 * <FAB
 *   icon="add"
 *   onPress={handleAddRecipe}
 * />
 * ```
 */
export function FAB({
  icon = 'add',
  onPress,
  testID = 'fab',
}: FABProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#007AFF' : '#007AFF';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <Icon name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

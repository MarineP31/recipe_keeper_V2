/**
 * ViewModeToggle component for switching between grid and list views
 * Displays icon buttons for grid and list modes
 */

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { ViewMode } from '@/lib/hooks/useRecipes';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
  testID?: string;
}

/**
 * Toggle button for switching between grid and list view modes
 *
 * @param props - Component props
 * @returns ViewModeToggle component
 *
 * @example
 * ```tsx
 * <ViewModeToggle
 *   viewMode={viewMode}
 *   onToggle={setViewMode}
 * />
 * ```
 */
export function ViewModeToggle({
  viewMode,
  onToggle,
  testID = 'view-mode-toggle',
}: ViewModeToggleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? '#007AFF' : '#007AFF';
  const inactiveColor = isDark ? '#8E8E93' : '#8E8E93';
  const backgroundColor = isDark ? '#1C1C1E' : '#F2F2F7';

  return (
    <View style={[styles.container, { backgroundColor }]} testID={testID}>
      <TouchableOpacity
        onPress={() => onToggle('grid')}
        style={[
          styles.button,
          viewMode === 'grid' && styles.activeButton,
        ]}
        testID={`${testID}-grid`}
      >
        <Icon
          name="grid-outline"
          size={24}
          color={viewMode === 'grid' ? activeColor : inactiveColor}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        onPress={() => onToggle('list')}
        style={[
          styles.button,
          viewMode === 'list' && styles.activeButton,
        ]}
        testID={`${testID}-list`}
      >
        <Icon
          name="list-outline"
          size={24}
          color={viewMode === 'list' ? activeColor : inactiveColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginRight: 16,
  },
  button: {
    padding: 8,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 4,
  },
});

/**
 * EmptyState component
 * Displays friendly message when no content is available
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/**
 * EmptyState component for displaying no content messages
 *
 * @param props - Component props
 * @returns EmptyState component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="search-outline"
 *   title="No recipes found"
 *   message="Try adjusting your search or filters"
 *   actionLabel="Clear filters"
 *   onAction={clearFilters}
 * />
 * ```
 */
export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  actionLabel,
  onAction,
  testID = 'empty-state',
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? '#8E8E93' : '#8E8E93';
  const iconColor = isDark ? '#8E8E93' : '#C7C7CC';
  const buttonBackground = isDark ? '#007AFF' : '#007AFF';

  return (
    <View style={styles.container} testID={testID}>
      <Icon name={icon} size={64} color={iconColor} />

      <Text style={[styles.title, { color: textPrimary }]}>
        {title}
      </Text>

      <Text style={[styles.message, { color: textSecondary }]}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBackground }]}
          onPress={onAction}
          testID={`${testID}-action`}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

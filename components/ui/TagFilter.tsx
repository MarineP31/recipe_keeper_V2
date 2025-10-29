/**
 * TagFilter component for filtering recipes by tags
 * Displays horizontal scrollable list of tag chips
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import type { Recipe } from '@/lib/db';

interface TagFilterProps {
  recipes: Recipe[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  testID?: string;
}

/**
 * TagFilter component with horizontal scrollable chips
 *
 * @param props - Component props
 * @returns TagFilter component
 *
 * @example
 * ```tsx
 * <TagFilter
 *   recipes={recipes}
 *   selectedTags={selectedTags}
 *   onToggleTag={toggleTag}
 * />
 * ```
 */
export function TagFilter({
  recipes,
  selectedTags,
  onToggleTag,
  testID = 'tag-filter',
}: TagFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Extract unique tags from all recipes with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        counts.set(normalizedTag, (counts.get(normalizedTag) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sort by frequency
  }, [recipes]);

  if (tagCounts.length === 0) {
    return null;
  }

  const chipBackgroundActive = isDark ? '#007AFF' : '#007AFF';
  const chipBackgroundInactive = isDark ? '#2C2C2E' : '#E5E5EA';
  const chipTextActive = '#FFFFFF';
  const chipTextInactive = isDark ? '#FFFFFF' : '#000000';

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tagCounts.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onToggleTag(tag)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? chipBackgroundActive
                    : chipBackgroundInactive,
                },
              ]}
              testID={`${testID}-chip-${tag}`}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? chipTextActive : chipTextInactive,
                  },
                ]}
              >
                {tag}
              </Text>
              <Text
                style={[
                  styles.chipCount,
                  {
                    color: isSelected ? chipTextActive : chipTextInactive,
                    opacity: 0.7,
                  },
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});

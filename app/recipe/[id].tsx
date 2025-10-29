/**
 * Recipe Detail Screen
 * Displays full recipe information with actions
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { validateRecipeParams, getRecipeEditRoute } from '@/lib/navigation/helpers';
import { recipeService } from '@/lib/db/services/recipe-service';
import { RecipeActionsBottomSheet } from '@/components/recipes/RecipeActionsBottomSheet';
import { FAB } from '@/components/ui/FAB';
import type { Recipe } from '@/lib/db/schema/recipe';

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidParams, setIsValidParams] = useState(true);

  const { id } = params;

  // Validate params on mount
  useEffect(() => {
    if (!validateRecipeParams(params)) {
      setIsValidParams(false);
      setLoading(false);
    }
  }, [params]);

  // Fetch recipe data
  useEffect(() => {
    if (!isValidParams) return;

    let isMounted = true;

    async function fetchRecipe() {
      try {
        setLoading(true);
        setError(null);
        const data = await recipeService.getRecipeById(id as string);

        if (isMounted) {
          if (data) {
            setRecipe(data);
          } else {
            setError('Recipe not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load recipe');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRecipe();

    return () => {
      isMounted = false;
    };
  }, [id, isValidParams]);

  // Handle three-dot menu press
  const handleMenuPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  // Handle edit recipe
  const handleEditPress = useCallback(() => {
    const editRoute = getRecipeEditRoute(id as string);
    router.push(editRoute as any);
  }, [id, router]);

  // Handle delete recipe
  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Delete Recipe?',
      'This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipeService.deleteRecipe(id as string);
              router.back();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete recipe',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Retry',
                    onPress: handleDeletePress,
                  },
                ]
              );
            }
          },
        },
      ]
    );
  }, [id, router]);

  // Handle add to meal plan
  const handleAddToMealPlan = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Add to Meal Plan feature coming soon!',
      [{ text: 'OK' }]
    );
  }, []);

  // Format time display
  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get category icon
  const getCategoryIcon = (category: string): any => {
    const icons: Record<string, any> = {
      breakfast: 'breakfast-dining',
      lunch: 'lunch-dining',
      dinner: 'dinner-dining',
      snack: 'cookie',
      dessert: 'cake',
      appetizer: 'restaurant',
      beverage: 'local-cafe',
      other: 'restaurant-menu',
    };
    return icons[category.toLowerCase()] || 'restaurant-menu';
  };

  // Invalid params state
  if (!isValidParams) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen
          options={{
            title: 'Recipe Not Found',
            headerBackTitle: 'Back',
          }}
        />
        <Text style={styles.errorText}>Invalid recipe ID</Text>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Error',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render recipe detail
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: recipe.title,
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleMenuPress}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="more-vert" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage]}>
            <MaterialIcons
              name={getCategoryIcon(recipe.category)}
              size={64}
              color="#D1D5DB"
            />
          </View>
        )}

        {/* Recipe Title and Metadata */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {recipe.prepTime && (
              <View style={styles.metadataItem}>
                <MaterialIcons name="schedule" size={18} color="#6B7280" />
                <Text style={styles.metadataText}>
                  Prep: {formatTime(recipe.prepTime)}
                </Text>
              </View>
            )}
            {recipe.cookTime && (
              <View style={styles.metadataItem}>
                <MaterialIcons name="timer" size={18} color="#6B7280" />
                <Text style={styles.metadataText}>
                  Cook: {formatTime(recipe.cookTime)}
                </Text>
              </View>
            )}
            <View style={styles.metadataItem}>
              <MaterialIcons name="people" size={18} color="#6B7280" />
              <Text style={styles.metadataText}>
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <MaterialIcons
                name={getCategoryIcon(recipe.category)}
                size={18}
                color="#6B7280"
              />
              <Text style={styles.metadataText}>
                {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <MaterialIcons
                name="radio-button-unchecked"
                size={20}
                color="#9CA3AF"
              />
              <Text style={styles.ingredientText}>
                {ingredient.quantity && ingredient.unit
                  ? `${ingredient.quantity} ${ingredient.unit} `
                  : ingredient.quantity
                  ? `${ingredient.quantity} `
                  : ''}
                {ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB for Add to Meal Plan */}
      <FAB
        icon="calendar"
        onPress={handleAddToMealPlan}
        testID="add-to-meal-plan-fab"
      />

      {/* Bottom Sheet for Actions */}
      <RecipeActionsBottomSheet
        ref={bottomSheetRef}
        onEditPress={handleEditPress}
        onDeletePress={handleDeletePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tagText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});

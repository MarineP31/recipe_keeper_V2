/**
 * Recipe Form Screen Component
 * Task Group 5.3-5.7: Shared component for create and edit modes
 * Task Group 6.6: Integrated with unsaved changes detection
 * Handles form state, validation, and dynamic ingredient/step fields
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { DishCategory, MeasurementUnit, EnumUtils } from '@/constants/enums';
import { recipeService } from '@/lib/db/services/recipe-service';
import type { Recipe, Ingredient, CreateRecipeInput, UpdateRecipeInput } from '@/lib/db/schema/recipe';
import { validateRecipeForm, getFieldError, type RecipeFormData, type RecipeFormErrors } from '@/lib/validation/recipe-form-schema';
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges';

interface RecipeFormScreenProps {
  mode: 'create' | 'edit';
  recipeId?: string;
  onSave: (recipe: Recipe) => void;
}

interface FormIngredient {
  name: string;
  quantity: string; // String for text input, converted to number on save
  unit: MeasurementUnit | null;
}

/**
 * Shared recipe form component for create and edit modes
 * Includes unsaved changes protection
 */
export function RecipeFormScreen({ mode, recipeId, onSave }: RecipeFormScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Form state
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState('4');
  const [category, setCategory] = useState<DishCategory>(DishCategory.DINNER);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [tags, setTags] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<FormIngredient[]>([
    { name: '', quantity: '', unit: null },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(mode === 'edit');
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [initialValues, setInitialValues] = useState<string>('');

  // Theme colors
  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? '#8E8E93' : '#8E8E93';
  const inputBackground = isDark ? '#1C1C1E' : '#F2F2F7';
  const borderColor = isDark ? '#38383A' : '#C6C6C8';

  // Load recipe data in edit mode
  useEffect(() => {
    if (mode === 'edit' && recipeId) {
      loadRecipeData();
    }
  }, [mode, recipeId]);

  // Track dirty state
  useEffect(() => {
    if (mode === 'edit' && !loadingRecipe && initialValues) {
      const currentValues = JSON.stringify(getFormValues());
      setIsDirty(currentValues !== initialValues);
    } else if (mode === 'create') {
      // In create mode, form is dirty if any field has been modified
      const hasContent = Boolean(
        title ||
        servings !== '4' ||
        prepTime ||
        cookTime ||
        tags ||
        ingredients.some(i => i.name || i.quantity) ||
        steps.some(s => s)
      );
      setIsDirty(hasContent);
    }
  }, [title, servings, category, prepTime, cookTime, tags, ingredients, steps, initialValues, loadingRecipe]);

  const loadRecipeData = async () => {
    if (!recipeId) return;

    setLoadingRecipe(true);
    try {
      const recipe = await recipeService.getRecipeById(recipeId);
      if (recipe) {
        setTitle(recipe.title);
        setServings(recipe.servings.toString());
        setCategory(recipe.category);
        setPrepTime(recipe.prepTime?.toString() || '');
        setCookTime(recipe.cookTime?.toString() || '');
        setTags(recipe.tags.join(', '));
        setImageUri(recipe.imageUri);

        const formIngredients: FormIngredient[] = recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity?.toString() || '',
          unit: ing.unit,
        }));
        setIngredients(formIngredients.length > 0 ? formIngredients : [{ name: '', quantity: '', unit: null }]);
        setSteps(recipe.steps.length > 0 ? recipe.steps : ['']);

        // Store initial values for dirty detection
        setInitialValues(JSON.stringify({
          title: recipe.title,
          servings: recipe.servings.toString(),
          category: recipe.category,
          prepTime: recipe.prepTime?.toString() || '',
          cookTime: recipe.cookTime?.toString() || '',
          tags: recipe.tags.join(', '),
          ingredients: formIngredients,
          steps: recipe.steps,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipe data');
      console.error('Failed to load recipe:', error);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const getFormValues = () => ({
    title,
    servings,
    category,
    prepTime,
    cookTime,
    tags,
    ingredients,
    steps,
  });

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: null }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof FormIngredient, value: string | MeasurementUnit | null) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Step handlers
  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  // Validation and save
  const handleSave = async () => {
    setErrors({});

    // Prepare data for validation
    const formData: RecipeFormData = {
      title: title.trim(),
      servings: parseInt(servings, 10) || 0,
      category,
      prepTime: prepTime ? parseInt(prepTime, 10) : null,
      cookTime: cookTime ? parseInt(cookTime, 10) : null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      imageUri: imageUri || null,
      ingredients: ingredients.map(ing => ({
        name: ing.name.trim(),
        quantity: ing.quantity ? parseFloat(ing.quantity) : null,
        unit: ing.unit,
      })),
      steps: steps.map(s => s.trim()).filter(s => s),
    };

    // Validate form
    const validation = validateRecipeForm(formData);
    if (!validation.success) {
      setErrors(validation.errors || {});
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const input: CreateRecipeInput = {
          title: formData.title,
          servings: formData.servings,
          category: formData.category,
          ingredients: formData.ingredients as Ingredient[],
          steps: formData.steps,
          prepTime: formData.prepTime,
          cookTime: formData.cookTime,
          tags: formData.tags,
          imageUri: formData.imageUri,
        };
        const recipe = await recipeService.createRecipe(input);
        onSave(recipe);
      } else if (mode === 'edit' && recipeId) {
        const input: UpdateRecipeInput = {
          id: recipeId,
          title: formData.title,
          servings: formData.servings,
          category: formData.category,
          ingredients: formData.ingredients as Ingredient[],
          steps: formData.steps,
          prepTime: formData.prepTime,
          cookTime: formData.cookTime,
          tags: formData.tags,
          imageUri: formData.imageUri,
        };
        const recipe = await recipeService.updateRecipe(input);
        onSave(recipe);
      }
    } catch (error) {
      Alert.alert('Error', mode === 'create' ? 'Failed to create recipe' : 'Failed to update recipe');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unsaved changes protection (Task Group 6.6)
  const { showUnsavedChangesDialog } = useUnsavedChanges({
    isDirty,
    onSave: handleSave,
  });

  if (loadingRecipe) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>Loading recipe...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textPrimary }]}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
            placeholder="Recipe Title"
            placeholderTextColor={textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          {getFieldError(errors, 'title') && (
            <Text style={styles.errorText}>{getFieldError(errors, 'title')}</Text>
          )}
        </View>

        {/* Servings and Category Row */}
        <View style={styles.row}>
          <View style={[styles.column, styles.halfWidth]}>
            <Text style={[styles.label, { color: textPrimary }]}>
              Servings <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
              placeholder="4"
              placeholderTextColor={textSecondary}
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
            />
            {getFieldError(errors, 'servings') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'servings')}</Text>
            )}
          </View>

          <View style={[styles.column, styles.halfWidth]}>
            <Text style={[styles.label, { color: textPrimary }]}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, { backgroundColor: inputBackground, borderColor }]}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={[styles.picker, { color: textPrimary }]}
              >
                {EnumUtils.getAllDishCategories().map(cat => (
                  <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Prep Time and Cook Time Row */}
        <View style={styles.row}>
          <View style={[styles.column, styles.halfWidth]}>
            <Text style={[styles.label, { color: textPrimary }]}>Prep Time (min)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
              placeholder="15"
              placeholderTextColor={textSecondary}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.column, styles.halfWidth]}>
            <Text style={[styles.label, { color: textPrimary }]}>Cook Time (min)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
              placeholder="30"
              placeholderTextColor={textSecondary}
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textPrimary }]}>Tags</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
            placeholder="e.g. Italian, Vegetarian, Quick"
            placeholderTextColor={textSecondary}
            value={tags}
            onChangeText={setTags}
          />
          <Text style={[styles.hint, { color: textSecondary }]}>Separate tags with commas</Text>
        </View>

        {/* Image Placeholder */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textPrimary }]}>Image</Text>
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: inputBackground, borderColor }]}
            onPress={() => Alert.alert('Coming Soon', 'Image upload will be available soon')}
          >
            <Icon name="camera-outline" size={24} color={textSecondary} />
            <Text style={[styles.imageButtonText, { color: textSecondary }]}>
              {imageUri ? 'Change Image' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Ingredients <Text style={styles.required}>*</Text>
          </Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.dynamicFieldContainer}>
              <View style={styles.dynamicFieldContent}>
                <TextInput
                  style={[styles.input, styles.flexInput, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
                  placeholder="Ingredient name"
                  placeholderTextColor={textSecondary}
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(index, 'name', value)}
                />
                <TextInput
                  style={[styles.input, styles.smallInput, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
                  placeholder="Qty"
                  placeholderTextColor={textSecondary}
                  value={ingredient.quantity}
                  onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                  keyboardType="decimal-pad"
                />
                <View style={[styles.pickerContainer, styles.unitPicker, { backgroundColor: inputBackground, borderColor }]}>
                  <Picker
                    selectedValue={ingredient.unit}
                    onValueChange={(value) => updateIngredient(index, 'unit', value)}
                    style={[styles.picker, { color: textPrimary }]}
                  >
                    <Picker.Item label="Unit" value={null} />
                    {EnumUtils.getAllMeasurementUnits().map(unit => (
                      <Picker.Item key={unit} label={unit} value={unit} />
                    ))}
                  </Picker>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, ingredients.length === 1 && styles.removeButtonDisabled]}
                onPress={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                testID={`remove-ingredient-${index}`}
              >
                <Icon name="close-circle" size={24} color={ingredients.length === 1 ? '#C6C6C8' : '#FF3B30'} />
              </TouchableOpacity>
            </View>
          ))}
          {getFieldError(errors, 'ingredients') && (
            <Text style={styles.errorText}>{getFieldError(errors, 'ingredients')}</Text>
          )}
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Icon name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Steps <Text style={styles.required}>*</Text>
          </Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.dynamicFieldContainer}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepNumber, { color: textPrimary }]}>Step {index + 1}</Text>
                <TouchableOpacity
                  style={[styles.removeButton, steps.length === 1 && styles.removeButtonDisabled]}
                  onPress={() => removeStep(index)}
                  disabled={steps.length === 1}
                  testID={`remove-step-${index}`}
                >
                  <Icon name="close-circle" size={24} color={steps.length === 1 ? '#C6C6C8' : '#FF3B30'} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: inputBackground, color: textPrimary, borderColor }]}
                placeholder="Instruction"
                placeholderTextColor={textSecondary}
                value={step}
                onChangeText={(value) => updateStep(index, value)}
                multiline
                numberOfLines={3}
              />
            </View>
          ))}
          {getFieldError(errors, 'steps') && (
            <Text style={styles.errorText}>{getFieldError(errors, 'steps')}</Text>
          )}
          <TouchableOpacity style={styles.addButton} onPress={addStep}>
            <Icon name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          testID="save-button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {mode === 'create' ? 'Create Recipe' : 'Save Changes'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  flexInput: {
    flex: 1,
  },
  smallInput: {
    width: 70,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 44,
  },
  unitPicker: {
    width: 100,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  imageButton: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dynamicFieldContainer: {
    marginBottom: 12,
  },
  dynamicFieldContent: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonDisabled: {
    opacity: 0.3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

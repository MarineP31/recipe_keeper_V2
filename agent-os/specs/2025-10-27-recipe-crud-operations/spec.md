# Specification: Recipe CRUD Operations

## Goal
Enable users to create, view, edit, and delete recipes through intuitive mobile interfaces with form validation, image capture, and dynamic field management, integrating with the Local Storage Foundation database layer.

## User Stories
- As a user, I want to create a new recipe by entering title, ingredients, and instructions so that I can store my recipes digitally
- As a user, I want to add photos to my recipes using my camera or photo library so that I can remember what the dish looks like
- As a user, I want to view my recipe in a clean, readable format so that I can follow the instructions while cooking
- As a user, I want to edit any part of an existing recipe so that I can correct mistakes or update the recipe over time
- As a user, I want to delete recipes I no longer need with a confirmation step so that I don't accidentally lose recipes

## Core Requirements

### Create Recipe
- Multi-section scrollable form with basic info, time/servings, ingredients, instructions, and tags
- Required fields: Title, at least one ingredient with name, at least one instruction step
- Optional fields: Image, prep time, cook time, servings, source, tags
- Dynamic add/remove for ingredient entries (structured: name required, quantity optional, unit optional)
- Dynamic add/remove for instruction steps
- Image capture via camera or photo library selection using expo-camera and expo-image-picker
- Tag selection from predefined categories (Cuisine, Dietary, Meal Type, Cooking Method)
- Single "Save" button at end of form
- Form validation using React Hook Form and Zod schema
- Success toast notification after save
- Navigate to recipe detail view after successful creation

### Read Recipe
- Detail view displaying recipe image, title, source, prep/cook time, servings
- Formatted ingredient list with quantities and units
- Step-by-step numbered instructions
- Tags displayed as chips organized by category
- Action buttons: Edit, Delete, Add to Meal Plan (placeholder for future feature)
- Accessible from recipe list by tapping recipe card

### Update Recipe
- Pre-populated form with all existing recipe data
- Same structure and validation as Create form
- All fields editable including image (replace or remove capability)
- Success toast notification after save
- Navigate back to recipe detail view after successful update

### Delete Recipe
- Confirmation dialog: "Are you sure you want to delete [Recipe Title]? This cannot be undone."
- Hard delete from database (permanent removal)
- Success toast notification after deletion
- Navigate back to recipe list after successful deletion

## Visual Design
No visual mockups provided. Implementation should follow standard mobile recipe app UI patterns with React Native Reusables component design system and Nativewind styling.

## Reusable Components

### Existing Code to Leverage
- **Database Schema**: Use Recipe, Ingredient interfaces from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService CRUD operations (lib/db/services/recipe-service.ts)
- **Navigation Patterns**: Follow Expo Router file-based routing already configured in app/_layout.tsx
- **UI Foundation**: Build on existing ThemedText, ThemedView components in components/ directory
- **TypeScript Config**: Use strict mode TypeScript already configured
- **Enums**: DishCategory and MeasurementUnit from constants/enums.ts (defined in Local Storage Foundation)
- **Validation Pattern**: Apply Zod schema validation approach established in database layer

### New Components Required
- **Recipe Form Component**: No existing form patterns - need comprehensive form with dynamic arrays
- **Image Picker Component**: No expo-camera or expo-image-picker integration exists yet
- **Recipe Detail View**: New screen to display formatted recipe with action buttons
- **Ingredient Input Group**: Reusable component for Name/Quantity/Unit input trio
- **Step Input Field**: Reusable component for instruction step with reordering capability
- **Tag Selector**: Multi-select component for predefined tag categories
- **Delete Confirmation Dialog**: Alert dialog component for destructive actions
- **Recipe Form Screen**: Create/Edit form view (app/recipes/form.tsx)
- **Recipe Detail Screen**: Read view (app/recipes/[id].tsx)
- **FAB Button**: Floating action button for "Add Recipe" on list view

## Technical Approach

### File Structure
```
app/
├── recipes/
│   ├── [id].tsx                    # Recipe detail view (Read)
│   ├── form.tsx                    # Recipe create/edit form
│   └── _layout.tsx                 # Stack navigator for recipe screens

components/
├── recipes/
│   ├── recipe-form-fields.tsx      # Form field components
│   ├── ingredient-input.tsx        # Ingredient name/qty/unit input group
│   ├── step-input.tsx              # Instruction step input field
│   ├── tag-selector.tsx            # Tag category multi-select
│   ├── image-picker-button.tsx     # Camera/library image selection
│   └── recipe-detail-card.tsx      # Recipe display layout
├── ui/
│   ├── button.tsx                  # Button component (React Native Reusables)
│   ├── input.tsx                   # Input component (React Native Reusables)
│   ├── label.tsx                   # Label component (React Native Reusables)
│   ├── select.tsx                  # Select/dropdown (React Native Reusables)
│   ├── dialog.tsx                  # Dialog/modal (React Native Reusables)
│   ├── toast.tsx                   # Toast notification (React Native Reusables)
│   └── fab.tsx                     # Floating action button

lib/
├── validations/
│   └── recipe-form-schema.ts       # Zod schema for form validation
└── utils/
    └── image-processor.ts          # Image optimization and storage utilities
```

### Integration with Database Service Layer
- Import RecipeService from lib/db/services/recipe-service.ts
- Use RecipeService.create() for Create operation with type-safe Recipe object
- Use RecipeService.getById() for Read operation to fetch recipe data
- Use RecipeService.update() for Update operation with modified Recipe object
- Use RecipeService.delete() for Delete operation with recipe ID
- Handle database errors with try-catch and display error toast notifications
- Validate data with Zod before calling service methods

### Form Structure and Validation
**Zod Schema (lib/validations/recipe-form-schema.ts):**
- title: z.string().min(1, "Title is required").max(200)
- ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.string().optional(),
    unit: z.enum([MeasurementUnit values]).optional()
  })).min(1, "At least one ingredient is required")
- steps: z.array(z.string().min(1, "Step cannot be empty")).min(1, "At least one step is required")
- servings: z.number().int().positive().optional()
- prepTime: z.number().int().positive().optional()
- cookTime: z.number().int().positive().optional()
- imageUri: z.string().optional()
- source: z.string().max(200).optional()
- tags: z.array(z.string()).optional()
- category: z.enum([DishCategory values]).optional()

**React Hook Form Setup:**
- useForm hook with zodResolver for validation
- useFieldArray for dynamic ingredients and steps arrays
- Real-time validation with mode: "onChange"
- Display inline error messages below each field
- Disable submit button until form is valid

### Predefined Tag Options
**Cuisine Tags:** Italian, Mexican, Asian, Chinese, Japanese, Thai, Indian, Mediterranean, French, American, Other

**Dietary Tags:** Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Low-Carb, Keto, Paleo, Other

**Meal Type Tags:** Breakfast, Lunch, Dinner, Snack, Dessert, Appetizer, Beverage, Other

**Cooking Method Tags:** Baking, Grilling, Roasting, Sautéing, Slow Cooker, Instant Pot, Stovetop, No-Cook, Other

### Image Handling Approach
- Use expo-image-picker for both camera capture and photo library access
- Present action sheet/dialog with two options: "Take Photo" and "Choose from Library"
- Request camera permissions (expo-image-picker handles permissions automatically)
- Optimize captured images: resize to max 1200px width, compress to 80% quality, convert to WebP format
- Store image file in app's document directory with UUID filename
- Save file URI (not base64) in database imageUri field
- Display thumbnail preview in form after selection
- Provide "Remove Image" option in Update form to delete existing image
- Handle permission denied errors gracefully with user-friendly messages

### Navigation Flows
**Create Flow:**
Recipe List Screen -> Tap FAB "+" -> app/recipes/form.tsx (no params) -> Save -> app/recipes/[id].tsx with new recipe ID

**Read Flow:**
Recipe List Screen -> Tap Recipe Card -> app/recipes/[id].tsx with recipe ID

**Update Flow:**
Recipe Detail (app/recipes/[id].tsx) -> Tap "Edit" button -> app/recipes/form.tsx?id=[recipeId] -> Save -> app/recipes/[id].tsx

**Delete Flow:**
Recipe Detail (app/recipes/[id].tsx) -> Tap "Delete" button -> Confirmation Dialog -> Confirm -> Recipe List Screen

### UI Components from React Native Reusables
- **Input**: Text input for title, source, time fields, ingredient name, quantities
- **Label**: Accessible labels for all form fields
- **Button**: Primary button for Save, secondary for Cancel, destructive for Delete
- **Select/Dropdown**: Unit selection for ingredients (optional dropdown implementation)
- **Dialog/AlertDialog**: Delete confirmation modal
- **Toast**: Success and error notifications (e.g., "Recipe saved successfully", "Recipe deleted")
- **Badge/Chip**: Display tags in detail view
- **Card**: Container for recipe detail sections
- **ScrollView**: Scrollable form and detail view layout
- **FAB (Floating Action Button)**: "Add Recipe" button on list view

### Success Feedback via Toast
- **Create Success**: "Recipe created successfully"
- **Update Success**: "Recipe updated successfully"
- **Delete Success**: "Recipe deleted successfully"
- **Error Handling**: "Failed to save recipe. Please try again." or specific validation error messages
- Toast appears at bottom of screen for 3 seconds with auto-dismiss
- Use React Native Reusables Toast component for consistency

### Error Handling Strategy
- **Form Validation Errors**: Display inline below each field with red text
- **Database Operation Errors**: Show error toast with retry option
- **Image Upload Errors**: Display error message and allow user to retry or skip image
- **Permission Denied**: Show alert dialog explaining why permission is needed with link to settings
- **Network/Storage Errors**: Graceful degradation with clear error messages
- **Missing Required Data**: Prevent form submission with validation error highlights

### Module Organization Pattern
- Group recipe-related screens in app/recipes/ directory
- Shared recipe components in components/recipes/
- UI primitives in components/ui/ (React Native Reusables)
- Business logic validations in lib/validations/
- Utility functions in lib/utils/
- Database operations abstracted through service layer (lib/db/services/)
- Keep screens thin - logic in custom hooks (e.g., useRecipeForm, useRecipeDetail)

## Success Criteria
- User can create a recipe with all required fields and save to database in under 2 minutes
- Form validation provides clear, immediate feedback for invalid inputs
- Recipe detail view displays all recipe information in readable, organized format
- Images captured via camera or selected from library display correctly in forms and detail view
- Edit operation pre-fills all existing data and saves updates without data loss
- Delete operation requires confirmation and permanently removes recipe from database
- All CRUD operations complete in under 1 second for typical recipe (10 ingredients, 8 steps)
- Toast notifications appear for all success and error states
- Navigation flows work smoothly without unexpected back stack behavior
- Forms work correctly with dynamic ingredient/step arrays (add, remove, reorder)
- Tag selection supports multiple selections across all four categories
- Zero crashes during recipe CRUD operations in testing

## Out of Scope
- OCR recipe capture (separate feature entirely)
- Recipe scaling/serving size adjustment
- Recipe duplication functionality
- Bulk operations (multi-select, bulk delete)
- Recipe sharing or export features
- Importing recipes from URLs
- Nutrition calculation
- Cooking mode interface (timers, voice control)
- Recipe collections or grouping system
- Favoriting mechanism
- Rating or review system
- Print functionality
- Soft deletes (recoverable deletion)
- Custom tag creation (only predefined tags in MVP)
- Recipe versioning or history
- Collaborative editing
- Cloud sync and backup (Phase 2)
- Cross-device synchronization (Phase 2)
- Advanced search within recipe CRUD screens (covered by separate Recipe Repository UI feature)

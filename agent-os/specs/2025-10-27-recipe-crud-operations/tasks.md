# Tasks: Recipe CRUD Operations

## Overview

Enable users to create, view, edit, and delete recipes through intuitive mobile interfaces with form validation, image capture, and dynamic field management, integrating with the Local Storage Foundation database layer.

## Task Groups

### Group 1: Dependencies & Setup

**Priority: Critical | Estimated Time: 2-3 hours**

#### Task 1.1: Package Installation & Configuration

- [ ] Install `expo-image-picker` for camera and photo library access
- [ ] Install `expo-camera` for camera permissions
- [ ] Install `react-hook-form` for form management
- [ ] Install `@hookform/resolvers` for Zod integration
- [ ] Install `zod` for schema validation
- [ ] Install `react-native-reusables` UI component library
- [ ] Update package.json with new dependencies
- [ ] Configure TypeScript types for new packages

#### Task 1.2: Project Structure Setup

- [ ] Create `app/recipes/` directory structure
- [ ] Create `components/recipes/` directory structure
- [ ] Create `components/ui/` directory structure
- [ ] Create `lib/validations/` directory structure
- [ ] Create `lib/utils/` directory structure
- [ ] Set up recipe-specific navigation routes
- [ ] Configure file structure for recipe components
- [ ] Add recipe-specific assets and configurations

#### Task 1.3: Permission Configuration

- [ ] Configure camera permissions in app.json
- [ ] Configure photo library permissions in app.json
- [ ] Set up permission request handlers
- [ ] Add permission denial handling
- [ ] Test permissions on iOS and Android
- [ ] Add permission status checking utilities

### Group 2: Database Schema & Validation

**Priority: Critical | Estimated Time: 4-5 hours**

#### Task 2.1: Recipe Form Schema

- [ ] Create `lib/validations/recipe-form-schema.ts`
- [ ] Define Zod schema for recipe form validation
- [ ] Add title validation (required, max 200 characters)
- [ ] Add ingredients validation (array, min 1, name required)
- [ ] Add instructions validation (array, min 1, non-empty)
- [ ] Add optional fields validation (servings, prep time, cook time)
- [ ] Add image and source validation
- [ ] Add tags validation (predefined options only)

#### Task 2.2: Ingredient Schema

- [ ] Define ingredient object schema
- [ ] Add name field validation (required)
- [ ] Add quantity field validation (optional)
- [ ] Add unit field validation (optional, enum values)
- [ ] Add order index validation
- [ ] Test ingredient schema validation
- [ ] Add ingredient array validation

#### Task 2.3: Instruction Schema

- [ ] Define instruction step schema
- [ ] Add step text validation (required, non-empty)
- [ ] Add order index validation
- [ ] Test instruction schema validation
- [ ] Add instruction array validation

#### Task 2.4: Tag Schema

- [ ] Define tag categories enum
- [ ] Add cuisine tags validation
- [ ] Add dietary tags validation
- [ ] Add meal type tags validation
- [ ] Add cooking method tags validation
- [ ] Test tag schema validation
- [ ] Add tag array validation

### Group 3: UI Components Foundation

**Priority: High | Estimated Time: 6-8 hours**

#### Task 3.1: React Native Reusables Setup

- [ ] Install and configure React Native Reusables
- [ ] Set up Button component
- [ ] Set up Input component
- [ ] Set up Label component
- [ ] Set up Select/Dropdown component
- [ ] Set up Dialog/Modal component
- [ ] Set up Toast component
- [ ] Set up FAB (Floating Action Button) component

#### Task 3.2: Base UI Components

- [ ] Create `components/ui/button.tsx` wrapper
- [ ] Create `components/ui/input.tsx` wrapper
- [ ] Create `components/ui/label.tsx` wrapper
- [ ] Create `components/ui/select.tsx` wrapper
- [ ] Create `components/ui/dialog.tsx` wrapper
- [ ] Create `components/ui/toast.tsx` wrapper
- [ ] Create `components/ui/fab.tsx` wrapper
- [ ] Test all base UI components

#### Task 3.3: Recipe-Specific Components

- [ ] Create `components/recipes/ingredient-input.tsx`
- [ ] Create `components/recipes/step-input.tsx`
- [ ] Create `components/recipes/tag-selector.tsx`
- [ ] Create `components/recipes/image-picker-button.tsx`
- [ ] Create `components/recipes/recipe-detail-card.tsx`
- [ ] Create `components/recipes/recipe-form-fields.tsx`
- [ ] Test all recipe-specific components

### Group 4: Image Handling System

**Priority: High | Estimated Time: 5-6 hours**

#### Task 4.1: Image Picker Component

- [ ] Create `components/recipes/image-picker-button.tsx`
- [ ] Implement camera capture functionality
- [ ] Implement photo library selection
- [ ] Add action sheet for source selection
- [ ] Implement permission handling
- [ ] Add image preview functionality
- [ ] Test image picker on both platforms

#### Task 4.2: Image Processing Utilities

- [ ] Create `lib/utils/image-processor.ts`
- [ ] Implement image optimization (resize to max 1200px width)
- [ ] Add image compression (80% quality)
- [ ] Implement WebP format conversion
- [ ] Add UUID filename generation
- [ ] Implement image storage in document directory
- [ ] Add image cleanup utilities

#### Task 4.3: Image Display Components

- [ ] Implement image thumbnail display
- [ ] Add full-size image viewing
- [ ] Implement image removal functionality
- [ ] Add image loading states
- [ ] Implement image error handling
- [ ] Test image display across different screen sizes

### Group 5: Recipe Form Implementation

**Priority: High | Estimated Time: 8-10 hours**

#### Task 5.1: Recipe Form Screen

- [ ] Create `app/recipes/form.tsx` screen
- [ ] Implement React Hook Form setup
- [ ] Add Zod resolver integration
- [ ] Implement form state management
- [ ] Add real-time validation
- [ ] Implement form submission handling
- [ ] Add error handling and display

#### Task 5.2: Basic Info Section

- [ ] Implement title input field
- [ ] Add source input field
- [ ] Integrate image picker component
- [ ] Add image preview and removal
- [ ] Implement validation for basic info
- [ ] Add error message display

#### Task 5.3: Time & Servings Section

- [ ] Implement prep time input field
- [ ] Add cook time input field
- [ ] Implement servings input field
- [ ] Add number input validation
- [ ] Implement time format handling
- [ ] Add optional field indicators

#### Task 5.4: Dynamic Ingredients Section

- [ ] Implement useFieldArray for ingredients
- [ ] Add ingredient input component integration
- [ ] Implement add ingredient functionality
- [ ] Add remove ingredient functionality
- [ ] Implement ingredient reordering
- [ ] Add minimum ingredient validation

#### Task 5.5: Dynamic Instructions Section

- [ ] Implement useFieldArray for instructions
- [ ] Add step input component integration
- [ ] Implement add step functionality
- [ ] Add remove step functionality
- [ ] Implement step reordering
- [ ] Add minimum step validation

#### Task 5.6: Tags Section

- [ ] Implement tag selector component
- [ ] Add multi-select functionality
- [ ] Implement tag category organization
- [ ] Add tag validation
- [ ] Implement tag display
- [ ] Add tag removal functionality

### Group 6: Recipe Detail View

**Priority: High | Estimated Time: 6-7 hours**

#### Task 6.1: Recipe Detail Screen

- [ ] Create `app/recipes/[id].tsx` screen
- [ ] Implement recipe data fetching
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add navigation integration
- [ ] Test recipe detail screen

#### Task 6.2: Recipe Display Layout

- [ ] Implement recipe image display
- [ ] Add recipe title display
- [ ] Implement source attribution display
- [ ] Add time and servings display
- [ ] Implement ingredient list display
- [ ] Add instruction steps display

#### Task 6.3: Action Buttons

- [ ] Implement Edit button
- [ ] Add Delete button
- [ ] Add "Add to Meal Plan" placeholder button
- [ ] Implement button styling
- [ ] Add button accessibility
- [ ] Test action button functionality

#### Task 6.4: Tags Display

- [ ] Implement tag chips display
- [ ] Add tag category organization
- [ ] Implement tag styling
- [ ] Add tag accessibility
- [ ] Test tag display functionality

### Group 7: CRUD Operations Integration

**Priority: High | Estimated Time: 6-8 hours**

#### Task 7.1: Create Operation

- [ ] Integrate RecipeService.create() method
- [ ] Implement form data transformation
- [ ] Add database error handling
- [ ] Implement success toast notification
- [ ] Add navigation to recipe detail
- [ ] Test create operation end-to-end

#### Task 7.2: Read Operation

- [ ] Integrate RecipeService.getById() method
- [ ] Implement recipe data fetching
- [ ] Add loading state management
- [ ] Implement error handling
- [ ] Add data validation
- [ ] Test read operation

#### Task 7.3: Update Operation

- [ ] Integrate RecipeService.update() method
- [ ] Implement form pre-population
- [ ] Add update data transformation
- [ ] Implement success toast notification
- [ ] Add navigation back to detail
- [ ] Test update operation end-to-end

#### Task 7.4: Delete Operation

- [ ] Integrate RecipeService.delete() method
- [ ] Implement delete confirmation dialog
- [ ] Add confirmation dialog component
- [ ] Implement success toast notification
- [ ] Add navigation back to list
- [ ] Test delete operation end-to-end

### Group 8: Navigation Integration

**Priority: Medium | Estimated Time: 4-5 hours**

#### Task 8.1: Recipe Navigation Layout

- [ ] Create `app/recipes/_layout.tsx` stack navigator
- [ ] Implement recipe screen navigation
- [ ] Add navigation state management
- [ ] Implement back button handling
- [ ] Add navigation transitions
- [ ] Test navigation flows

#### Task 8.2: FAB Integration

- [ ] Implement FAB button on recipe list
- [ ] Add FAB styling and positioning
- [ ] Implement FAB press handling
- [ ] Add FAB accessibility
- [ ] Test FAB functionality
- [ ] Integrate with navigation flow

#### Task 8.3: Navigation Flows

- [ ] Implement Create flow navigation
- [ ] Add Read flow navigation
- [ ] Implement Update flow navigation
- [ ] Add Delete flow navigation
- [ ] Test all navigation flows
- [ ] Add navigation error handling

### Group 9: Form Validation & Error Handling

**Priority: Medium | Estimated Time: 5-6 hours**

#### Task 9.1: Form Validation Implementation

- [ ] Implement real-time validation
- [ ] Add inline error message display
- [ ] Implement field-level validation
- [ ] Add form-level validation
- [ ] Implement validation error styling
- [ ] Test validation across all fields

#### Task 9.2: Error Handling System

- [ ] Implement database error handling
- [ ] Add image upload error handling
- [ ] Implement permission error handling
- [ ] Add network error handling
- [ ] Implement validation error handling
- [ ] Add error recovery mechanisms

#### Task 9.3: Success Feedback System

- [ ] Implement success toast notifications
- [ ] Add create success feedback
- [ ] Implement update success feedback
- [ ] Add delete success feedback
- [ ] Implement error toast notifications
- [ ] Test all feedback systems

### Group 10: Delete Confirmation System

**Priority: Medium | Estimated Time: 3-4 hours**

#### Task 10.1: Confirmation Dialog Component

- [ ] Create delete confirmation dialog component
- [ ] Implement dialog styling
- [ ] Add confirmation message
- [ ] Implement cancel functionality
- [ ] Add confirm functionality
- [ ] Test dialog component

#### Task 10.2: Delete Flow Integration

- [ ] Integrate confirmation dialog with delete button
- [ ] Implement dialog state management
- [ ] Add dialog accessibility
- [ ] Implement dialog animations
- [ ] Test delete confirmation flow
- [ ] Add dialog error handling

### Group 11: Performance & Optimization

**Priority: Medium | Estimated Time: 4-5 hours**

#### Task 11.1: Form Performance

- [ ] Optimize dynamic field rendering
- [ ] Implement FlatList for large ingredient lists
- [ ] Add form state optimization
- [ ] Implement lazy loading for images
- [ ] Add form validation optimization
- [ ] Test form performance

#### Task 11.2: Image Performance

- [ ] Optimize image compression
- [ ] Implement image caching
- [ ] Add image lazy loading
- [ ] Implement image memory management
- [ ] Add image loading optimization
- [ ] Test image performance

#### Task 11.3: Database Performance

- [ ] Optimize database queries
- [ ] Add database indexing
- [ ] Implement query optimization
- [ ] Add database connection management
- [ ] Implement data caching
- [ ] Test database performance

### Group 12: Testing & Quality Assurance

**Priority: Medium | Estimated Time: 6-8 hours**

#### Task 12.1: Unit Tests

- [ ] Create tests for recipe form validation
- [ ] Test ingredient input components
- [ ] Test instruction input components
- [ ] Test tag selector components
- [ ] Test image picker components
- [ ] Test recipe detail components

#### Task 12.2: Integration Tests

- [ ] Test complete create flow
- [ ] Test complete read flow
- [ ] Test complete update flow
- [ ] Test complete delete flow
- [ ] Test navigation flows
- [ ] Test error handling scenarios

#### Task 12.3: End-to-End Tests

- [ ] Test recipe creation with all fields
- [ ] Test recipe creation with minimal fields
- [ ] Test recipe editing with image changes
- [ ] Test recipe deletion with confirmation
- [ ] Test form validation edge cases
- [ ] Test image handling edge cases

#### Task 12.4: Performance Tests

- [ ] Test form performance with many ingredients
- [ ] Test form performance with many steps
- [ ] Test image processing performance
- [ ] Test database operation performance
- [ ] Test navigation performance
- [ ] Validate success criteria performance targets

## Success Criteria Checklist

- [ ] User can create a recipe with all required fields and save to database in under 2 minutes
- [ ] Form validation provides clear, immediate feedback for invalid inputs
- [ ] Recipe detail view displays all recipe information in readable, organized format
- [ ] Images captured via camera or selected from library display correctly in forms and detail view
- [ ] Edit operation pre-fills all existing data and saves updates without data loss
- [ ] Delete operation requires confirmation and permanently removes recipe from database
- [ ] All CRUD operations complete in under 1 second for typical recipe (10 ingredients, 8 steps)
- [ ] Toast notifications appear for all success and error states
- [ ] Navigation flows work smoothly without unexpected back stack behavior
- [ ] Forms work correctly with dynamic ingredient/step arrays (add, remove, reorder)
- [ ] Tag selection supports multiple selections across all four categories
- [ ] Zero crashes during recipe CRUD operations in testing

## Dependencies

- Local Storage Foundation (database schema and services)
- expo-image-picker package
- expo-camera package
- react-hook-form package
- zod package
- react-native-reusables package

## Notes

- This is foundational functionality that other features will build upon
- Focus on establishing patterns that future features will follow
- Ensure proper error handling and user feedback throughout
- Test thoroughly with various recipe sizes and complexities
- Optimize for mobile performance and user experience
- Maintain consistency with React Native Reusables design system

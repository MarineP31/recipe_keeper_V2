# Specification: Recipe Detail View

## Goal

Create a comprehensive recipe detail screen that displays full recipe information in a clean, readable format with action buttons for editing, deleting, and adding to meal plans, serving as the primary interface for recipe viewing and management.

## User Stories

- As a user, I want to view my recipe in a clean, readable format so that I can follow the instructions while cooking
- As a user, I want to see all recipe information at a glance including ingredients, instructions, and cooking times so that I can plan my cooking session
- As a user, I want to quickly edit or delete recipes from the detail view so that I can manage my recipe collection efficiently
- As a user, I want to add recipes to my meal planning queue from the detail view so that I can plan my weekly meals
- As a user, I want to navigate seamlessly between recipe viewing and other app features so that I can maintain my cooking workflow

## Core Requirements

### Display Functionality

- Single scrollable view displaying complete recipe information with clear visual hierarchy
- Full-width hero image at the top of the screen (or placeholder if no image)
- Recipe title displayed prominently below the image
- Source attribution and tags grouped together in a dedicated section
- Cooking metadata (prep time, cook time, servings) in a horizontal info bar with icons
- Ingredients list formatted as "quantity unit name" (e.g., "2 cups flour")
- Instructions displayed as automatically numbered steps in vertical list format
- Smooth scrolling through all content with image scrolling with content
- Default placeholder image for recipes without photos

### Action Buttons

- Three primary actions in fixed header: "Edit", "Delete", "Add to Queue"
- Context-aware button visibility based on navigation source:
  - From recipe list: Show all three buttons
  - After creating recipe: Show all three buttons
  - After editing recipe: Show all three buttons
  - From queue screen: Hide "Add to Queue" or change to "Remove from Queue"
- Fixed header position for easy access while scrolling through content

### Navigation Entry Points

- From Recipe Repository (tap recipe card)
- After creating new recipe (redirect to detail view)
- After editing recipe (return to detail view)
- From meal planning queue screen (view recipe details)

### Data Display Requirements

- Recipe title (large, bold typography)
- Recipe image (full-width hero image or placeholder)
- Source attribution (plain text only for MVP)
- Tags (visual display as chips/badges)
- Prep time, cook time, servings (horizontal info bar with icons)
- Ingredients list (formatted as "quantity unit name")
- Instructions (auto-numbered vertical list)

## Visual Design

### Layout Structure

```
┌─────────────────────────┐
│ [Header: Edit Delete Queue] │
├─────────────────────────┤
│                         │
│    Full-Width Hero      │
│       Image or          │
│     Placeholder         │
│                         │
├─────────────────────────┤
│   Recipe Title          │
├─────────────────────────┤
│   Source | Tags         │
├─────────────────────────┤
│ [icon] Prep  [icon] Cook  [icon] Servings │
│   15min      30min         4               │
├─────────────────────────┤
│   Ingredients           │
│   • 2 cups flour        │
│   • 1 tsp salt          │
│   • ...                 │
├─────────────────────────┤
│   Instructions          │
│   1. First step...      │
│   2. Second step...     │
│   3. ...                │
└─────────────────────────┘
```

### Visual Hierarchy

- Hero image dominates top of screen (full-width)
- Title is large and bold for immediate recognition
- Metadata info bar is visually grouped with icons for quick scanning
- Clear section breaks between ingredients and instructions
- Consistent spacing and typography throughout
- Clean, readable layout optimized for recipe viewing

### Design Principles

- Static display (no interactive cooking features for MVP)
- Sufficient white space for comfortable reading
- Clear visual grouping of related information
- Mobile-first responsive design
- Accessibility: good contrast, readable font sizes, clear tap targets
- Follow app's existing design system and color scheme

## Reusable Components

### Existing Code to Leverage

- **Database Schema**: Use Recipe, Ingredient interfaces from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService.getById() operation (lib/db/services/recipe-service.ts)
- **Navigation Patterns**: Follow Expo Router file-based routing already configured in app/\_layout.tsx
- **UI Foundation**: Build on existing ThemedText, ThemedView components in components/ directory
- **TypeScript Config**: Use strict mode TypeScript already configured
- **Enums**: DishCategory and MeasurementUnit from constants/enums.ts (defined in Local Storage Foundation)
- **Recipe Card Components**: Leverage patterns from Recipe Repository UI for consistency

### New Components Required

- **RecipeDetailScreen**: Main screen component (app/recipes/[id].tsx)
- **RecipeHeader**: Fixed header with action buttons
- **RecipeHeroImage**: Full-width image with placeholder fallback
- **RecipeTitle**: Styled title text component
- **RecipeMetaInfo**: Source and tags display section
- **RecipeInfoBar**: Horizontal bar with prep/cook/servings icons
- **IngredientsList**: Formatted ingredient list component
- **InstructionsList**: Auto-numbered instruction steps component
- **PlaceholderImage**: Default recipe image component
- **ActionButton**: Header action button component

## Technical Approach

### File Structure

```
app/
├── recipes/
│   ├── [id].tsx                    # Recipe detail view screen
│   └── _layout.tsx                 # Stack navigator for recipe screens

components/
├── recipes/
│   ├── recipe-detail-header.tsx    # Fixed header with action buttons
│   ├── recipe-hero-image.tsx       # Full-width image with placeholder
│   ├── recipe-title.tsx            # Styled title component
│   ├── recipe-meta-info.tsx        # Source and tags section
│   ├── recipe-info-bar.tsx         # Horizontal metadata bar with icons
│   ├── ingredients-list.tsx        # Formatted ingredient list
│   ├── instructions-list.tsx       # Auto-numbered instruction steps
│   └── placeholder-image.tsx       # Default recipe image
├── ui/
│   ├── button.tsx                  # Button component (React Native Reusables)
│   ├── dialog.tsx                  # Dialog/modal (React Native Reusables)
│   ├── toast.tsx                   # Toast notification (React Native Reusables)
│   └── icon.tsx                    # Icon components for info bar

lib/
├── hooks/
│   └── use-recipe-detail.ts        # Custom hook for recipe data fetching
└── utils/
    └── recipe-formatter.ts         # Utility functions for formatting display data
```

### Integration with Database Service Layer

- Import RecipeService from lib/db/services/recipe-service.ts
- Use RecipeService.getById() to fetch complete recipe data
- Handle database errors with try-catch and display error toast notifications
- Receive recipe ID as navigation parameter from route params
- Handle missing/optional fields gracefully in display components

### Navigation Integration

- React Navigation integration for routing from multiple entry points
- Context parameters to determine button visibility/behavior
- Back navigation to appropriate source screen based on entry point
- Route parameters: `{ id: string, source?: 'list' | 'create' | 'edit' | 'queue' }`

### Action Button Behavior

- **Edit**: Navigate to Recipe Editor with pre-populated data (app/recipes/form.tsx?id=[recipeId])
- **Delete**: Show confirmation dialog, then remove from storage and navigate back
- **Add to Queue**: Add recipe to meal planning queue (integration with meal planning feature)
- **Remove from Queue**: Remove recipe from meal planning queue (when accessed from queue screen)

### Image Handling

- Support for local image URIs from device storage
- Default placeholder asset for recipes without images
- Full-width responsive image display
- Smooth loading states for image display
- Handle image loading errors gracefully

### Performance Considerations

- Optimize large instruction lists with appropriate rendering
- Handle image loading states smoothly
- Ensure scroll performance with long content
- Lazy loading for images if needed
- Efficient re-rendering on data updates

## Context-Aware Behavior Details

### Navigation Context Handling

1. **From Recipe List:**

   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation returns to recipe list
   - Route params: `{ id: string, source: 'list' }`

2. **After Creating Recipe:**

   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation may return to recipe list or editor depending on flow
   - Route params: `{ id: string, source: 'create' }`

3. **After Editing Recipe:**

   - Show all three buttons: Edit, Delete, Add to Queue
   - Back navigation may return to recipe list or previous screen
   - Route params: `{ id: string, source: 'edit' }`

4. **From Queue Screen:**
   - Hide "Add to Queue" button (already in queue)
   - Show "Remove from Queue" button instead
   - Edit and Delete remain available
   - Back navigation returns to queue screen
   - Route params: `{ id: string, source: 'queue' }`

### Implementation Note

Navigation parameters should include source context to enable appropriate button configuration and back navigation behavior.

## Success Criteria

- Recipe detail view displays all recipe information in readable, organized format
- Hero image displays correctly with placeholder fallback for missing images
- Action buttons work correctly based on navigation context
- Smooth scrolling performance with long recipe content
- Edit button navigates to pre-populated form with existing data
- Delete button shows confirmation dialog and removes recipe permanently
- Add to Queue button integrates with meal planning system
- Navigation flows work smoothly without unexpected back stack behavior
- All recipe data fields display correctly with proper formatting
- Zero crashes during recipe detail view operations in testing
- Loading states handle gracefully for image and data fetching
- Error states display appropriate user-friendly messages

## Out of Scope (MVP)

- Interactive ingredient checkboxes for marking off while cooking
- Step completion tracking or progress indicators
- Cooking mode features (large text, hands-free interface)
- Timer integration or alerts
- Keep-screen-awake functionality
- Voice control or voice commands
- Servings scaling with automatic quantity adjustment
- Pinch-to-zoom gesture on images
- Swipe gestures for next/previous recipe navigation
- Tappable URL links for source attribution
- Nutrition information display
- Recipe sharing functionality
- Print or export options
- Recipe collections or related recipes
- Comments or notes section
- Recipe rating or review system
- Social features or community integration

## Future Enhancements (Phase 2+)

- Cooking mode with hands-free interface (Phase 3)
- Integrated timers and alerts (Phase 3)
- Smart ingredient scaling when adjusting servings (Phase 3)
- Interactive checkboxes for ingredients and step completion (Phase 3)
- Tappable links for web sources (Phase 2)
- Recipe sharing and export (Phase 2)
- Recipe collections and related recipes (Phase 2)
- Advanced image viewing with zoom capabilities (Phase 2)
- Recipe notes and personal annotations (Phase 2)


# Specification: Tag Management System

## Goal

Create a comprehensive tag management system that allows users to organize recipes with predefined and custom tags across multiple categories, integrated into the recipe creation/editing flow, enabling efficient recipe discovery and consistent categorization.

## User Stories

- As a user, I want to manage predefined tags within existing categories so that I can customize the default tag options to match my cooking style
- As a user, I want to create custom tags within existing categories so that I can add specific tags that aren't in the predefined list
- As a user, I want to create entirely new tag categories so that I can organize recipes in ways that make sense to me
- As a user, I want to rename or delete custom categories so that I can refine my tagging system over time
- As a user, I want to access tag management from the recipe form so that I can manage tags while creating or editing recipes
- As a user, I want the system to prevent duplicate tag names so that my tag system stays organized and consistent
- As a user, I want automatic updates to recipes when I modify tags so that my recipe collection stays synchronized

## Core Requirements

### Tag Management Interface

- Accessible via "Manage Tags" button within the tag selection section of recipe creation/editing form
- Separate modal/screen for comprehensive tag management operations
- Search functionality within tag management interface for quick tag finding
- Visual organization by category with clear section breaks
- Intuitive add/edit/delete controls for tags and categories
- Clean, organized layout consistent with app's design system

### Predefined Tag Management

- Manage tags within existing default categories (Cuisine, Dietary, Meal Type, Cooking Method)
- Add new tags to predefined categories (max 20 custom tags per category)
- Remove tags from predefined categories (with automatic recipe updates)
- Rename tags within predefined categories (with automatic recipe updates)
- Default categories always present and cannot be deleted
- Visual distinction between default and custom categories

### Custom Tag Creation

- Create custom tags within existing categories (max 20 per category)
- Create entirely new custom tag categories (max 10 total custom categories)
- Tag name length limit of 30 characters
- Global duplicate tag name prevention across all categories
- Validation for tag name uniqueness and length constraints

### Category Management

- Rename existing custom categories
- Delete custom categories (automatically removes tags from all recipes)
- Visual indicators for non-deletable default categories
- Confirmation dialogs for destructive actions (category deletion)
- Success/error feedback for all category operations

### Data Management

- Automatic updates to all recipes when tags are renamed or deleted
- Maintain referential integrity between tags and recipes
- Handle existing recipes when tags are modified
- Support for tag renaming across all recipes
- Automatic cleanup when categories are deleted

## Visual Design

### Tag Management Modal Layout

```
┌─────────────────────────────────┐
│ Tag Management              [×] │
├─────────────────────────────────┤
│ [🔍 Search tags...]             │
├─────────────────────────────────┤
│ Default Categories               │
│ ┌─────────────────────────────┐ │
│ │ Cuisine              [+20] │ │
│ │ • Italian • Mexican • Asian│ │
│ │ [+ Add Tag]                 │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Dietary              [+15] │ │
│ │ • Vegetarian • Vegan       │ │
│ │ [+ Add Tag]                 │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Custom Categories                │
│ ┌─────────────────────────────┐ │
│ │ Spice Level          [+5]   │ │
│ │ • Mild • Medium • Hot      │ │
│ │ [+ Add Tag] [✏️] [🗑️]      │ │
│ └─────────────────────────────┘ │
│ [+ Add Category]                │
└─────────────────────────────────┘
```

### Integration with Recipe Form

- "Manage Tags" button clearly visible in tag selection section
- Seamless transition to tag management modal
- Return to form with updated tag selections
- Visual feedback for tag changes
- Consistent styling with existing form components

## Reusable Components

### Existing Code to Leverage

- **Database Schema**: Use recipe_tags table structure from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService operations (lib/db/services/recipe-service.ts)
- **Predefined Tags**: Use existing tag categories and options from Recipe CRUD Operations spec
- **UI Components**: Build on React Native Reusables components and existing form patterns
- **Navigation Patterns**: Follow Expo Router file-based routing already configured
- **Validation Patterns**: Apply Zod schema validation approach established in database layer

### New Components Required

- **TagManagementModal**: Main modal component for tag management
- **CategorySection**: Component for displaying and managing each category
- **TagInput**: Input component for adding new tags with validation
- **CategoryInput**: Input component for creating new categories
- **TagChip**: Display component for individual tags with edit/delete actions
- **CategoryHeader**: Header component with category name and action buttons
- **TagSearchBar**: Search component for filtering tags within modal
- **ConfirmationDialog**: Dialog component for destructive actions
- **TagManagementButton**: Button component for accessing tag management from recipe form

## Technical Approach

### File Structure

```
app/
├── recipes/
│   └── form.tsx                    # Recipe form with tag management integration

components/
├── tags/
│   ├── tag-management-modal.tsx    # Main tag management modal
│   ├── category-section.tsx        # Category display and management
│   ├── tag-input.tsx               # Tag creation input
│   ├── category-input.tsx          # Category creation input
│   ├── tag-chip.tsx                # Individual tag display
│   ├── category-header.tsx         # Category header with actions
│   ├── tag-search-bar.tsx          # Search functionality
│   └── tag-management-button.tsx   # Access button for recipe form
├── ui/
│   ├── button.tsx                   # Button component (React Native Reusables)
│   ├── input.tsx                    # Input component (React Native Reusables)
│   ├── dialog.tsx                   # Dialog/modal (React Native Reusables)
│   ├── toast.tsx                    # Toast notification (React Native Reusables)
│   └── chip.tsx                     # Tag chip component (React Native Reusables)

lib/
├── db/
│   ├── schema/
│   │   └── tags.ts                 # Tag and category schema definitions
│   └── services/
│       └── tag-service.ts           # Tag management service layer
├── hooks/
│   └── use-tag-management.ts       # Custom hook for tag management logic
└── validations/
    └── tag-schema.ts               # Zod schema for tag validation
```

### Database Schema Updates

**New Tables:**

```sql
-- Custom categories table
custom_categories:
- id (primary key)
- name (text, required, max 30 chars)
- created_at (timestamp)
- updated_at (timestamp)

-- Extended recipe_tags table
recipe_tags:
- id (primary key)
- recipe_id (foreign key)
- category_type (text: 'default' | 'custom')
- category_name (text: predefined category name or custom category id)
- tag_value (text, required, max 30 chars)
- created_at (timestamp)
```

**Predefined Categories (Protected):**

- Cuisine: Italian, Mexican, Asian, Chinese, Japanese, Thai, Indian, Mediterranean, French, American, Other
- Dietary: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Low-Carb, Keto, Paleo, Other
- Meal Type: Breakfast, Lunch, Dinner, Snack, Dessert, Appetizer, Beverage, Other
- Cooking Method: Baking, Grilling, Roasting, Sautéing, Slow Cooker, Instant Pot, Stovetop, No-Cook, Other

### Integration with Database Service Layer

- Import RecipeService from lib/db/services/recipe-service.ts
- Create TagService for tag-specific operations (lib/db/services/tag-service.ts)
- Use TagService.createTag(), TagService.updateTag(), TagService.deleteTag()
- Use TagService.createCategory(), TagService.updateCategory(), TagService.deleteCategory()
- Handle database errors with try-catch and display error toast notifications
- Validate data with Zod before calling service methods

### Tag Service Operations

**TagService Methods:**

- `getAllTags()` - Fetch all tags organized by category
- `getTagsByCategory(categoryName)` - Fetch tags for specific category
- `createTag(categoryName, tagValue)` - Create new tag
- `updateTag(tagId, newValue)` - Rename tag across all recipes
- `deleteTag(tagId)` - Remove tag from all recipes
- `createCategory(categoryName)` - Create new custom category
- `updateCategory(categoryId, newName)` - Rename category
- `deleteCategory(categoryId)` - Delete category and all its tags
- `searchTags(query)` - Search tags by name
- `validateTagName(tagName)` - Check for duplicates and length

### Form Structure and Validation

**Zod Schema (lib/validations/tag-schema.ts):**

- tagValue: z.string().min(1, "Tag name is required").max(30, "Tag name too long")
- categoryName: z.string().min(1, "Category name is required").max(30, "Category name too long")
- customCategoryLimit: z.number().max(10, "Maximum 10 custom categories allowed")
- tagLimitPerCategory: z.number().max(20, "Maximum 20 tags per category allowed")

**Validation Rules:**

- Tag names: Required, max 30 characters, globally unique
- Category names: Required, max 30 characters, unique among custom categories
- Custom categories: Maximum 10 total
- Tags per category: Maximum 20 custom tags per category
- Default categories: Cannot be deleted or renamed

### UI Components from React Native Reusables

- **Input**: Text input for tag and category names
- **Button**: Primary button for Save, secondary for Cancel, destructive for Delete
- **Dialog/Modal**: Tag management modal and confirmation dialogs
- **Toast**: Success and error notifications
- **Chip**: Display tags as chips with edit/delete actions
- **ScrollView**: Scrollable modal content
- **SearchBar**: Search functionality within modal

### Success Feedback via Toast

- **Tag Created**: "Tag '[tag name]' created successfully"
- **Tag Updated**: "Tag renamed to '[new name]' across all recipes"
- **Tag Deleted**: "Tag '[tag name]' removed from all recipes"
- **Category Created**: "Category '[category name]' created successfully"
- **Category Updated**: "Category renamed to '[new name]'"
- **Category Deleted**: "Category '[category name]' and all its tags removed"
- **Error Handling**: "Failed to save changes. Please try again." or specific validation error messages

### Error Handling Strategy

- **Form Validation Errors**: Display inline below each field with red text
- **Database Operation Errors**: Show error toast with retry option
- **Duplicate Tag Names**: Show validation error with suggestion
- **Limit Exceeded**: Show clear error message explaining limits
- **Category Deletion**: Show confirmation dialog with impact explanation
- **Missing Required Data**: Prevent form submission with validation error highlights

### Navigation Flows

**Tag Management Flow:**
Recipe Form -> Tap "Manage Tags" button -> Tag Management Modal -> Make changes -> Save -> Return to Recipe Form with updated selections

**Category Management Flow:**
Tag Management Modal -> Tap category header actions -> Edit/Delete category -> Confirmation (if delete) -> Update modal display

**Tag Creation Flow:**
Tag Management Modal -> Tap "+ Add Tag" -> Enter tag name -> Validate -> Save -> Update category display

### Module Organization Pattern

- Group tag-related components in components/tags/ directory
- Tag management logic in custom hook (use-tag-management.ts)
- Business logic validations in lib/validations/
- Database operations abstracted through TagService layer
- Keep modal component focused on UI, logic in custom hook
- Reusable tag components for use across app

## Success Criteria

- User can access tag management from recipe form in under 2 taps
- Tag management modal loads and displays all categories in under 1 second
- Users can create custom tags with validation feedback in real-time
- Users can create custom categories with proper limits enforcement
- Tag renaming updates all recipes automatically without data loss
- Category deletion removes tags from all recipes with confirmation
- Search functionality finds tags quickly within large collections
- All tag operations complete in under 1 second for typical usage
- Toast notifications appear for all success and error states
- Navigation flows work smoothly without unexpected modal behavior
- Form validation prevents duplicate tag names and enforces limits
- Zero crashes during tag management operations in testing
- Default categories remain protected from deletion
- Custom category limits prevent UI clutter and performance issues

## Out of Scope (MVP)

- Bulk tag operations across multiple recipes
- Tag usage analytics or statistics
- Advanced search/filtering beyond basic tag search
- Tag import/export functionality
- Tag sharing between users
- Tag templates or presets
- Tag color coding or visual customization
- Tag hierarchy or subcategories
- Tag usage recommendations
- Tag cleanup or maintenance tools
- Tag drag-and-drop reordering
- Tag favorites or priority system
- Tag auto-suggestions based on recipe content
- Tag conflict resolution for duplicate names
- Tag versioning or history tracking
- Tag permissions or access control
- Tag backup and restore functionality
- Tag migration tools for existing recipes
- Tag performance analytics
- Tag usage reports or insights

## Future Enhancements (Phase 2+)

- Bulk tag operations across multiple recipes (Phase 2)
- Tag usage analytics and statistics (Phase 2)
- Advanced search and filtering capabilities (Phase 2)
- Tag templates and presets (Phase 2)
- Tag import/export functionality (Phase 2)
- Tag color coding and visual customization (Phase 2)
- Tag hierarchy and subcategories (Phase 3)
- Tag auto-suggestions based on recipe content (Phase 3)
- Tag conflict resolution and merge tools (Phase 3)
- Tag performance analytics and insights (Phase 3)
- Tag backup and restore functionality (Phase 3)
- Tag migration and cleanup tools (Phase 3)
- Tag sharing and collaboration features (Phase 3)
- Tag AI-powered categorization (Phase 3)
- Tag integration with external recipe sources (Phase 3)


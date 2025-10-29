# Specification: Recipe Repository UI

## Goal

Build grid and list view interfaces with recipe cards showing thumbnails, titles, servings, prep time, and cook time with search and tag filtering capabilities, replacing the current HomeScreen to serve as the primary navigation interface for recipe discovery and management.

## User Stories

- As a user, I want to see all my recipes in a visual grid or list format so that I can browse my collection easily
- As a user, I want to search for recipes by title so that I can quickly find specific recipes
- As a user, I want to filter recipes by tags so that I can find recipes that match my dietary preferences or cuisine types
- As a user, I want to switch between grid and list views so that I can choose the display format that works best for me
- As a user, I want to tap on recipe cards to view full recipe details so that I can access complete recipe information
- As a user, I want to add new recipes from the main screen so that I can quickly add recipes to my collection
- As a user, I want the app to remember my view preferences so that I don't have to switch views every time I open the app

## Core Requirements

### Recipe Display Interface

- Replace current HomeScreen (app/(tabs)/index.tsx) with recipe repository interface
- Display recipes in chronological order (newest first)
- Default to grid view with option to switch to list view
- Recipe cards show: thumbnail image, title, servings, prep time, cook time
- Infinite scroll with lazy loading for performance
- Handle missing images with placeholder
- Smooth transition between view modes

### Grid View Layout

- 2-column layout with equal-width cards
- Larger thumbnail images for visual appeal
- Card height based on content
- Consistent spacing between cards
- Responsive design for different screen sizes

### List View Layout

- Single-column layout for compact browsing
- Horizontal card layout with image on left side
- Compact information display
- Consistent row height for uniform appearance
- Efficient use of vertical space

### Search Functionality

- Search bar at top of screen
- Search by recipe title only (case-insensitive)
- Real-time search results as user types
- Clear search functionality with X button
- Search state persistence during session
- Debounced input for performance

### Tag Filtering System

- Filter chips/tags displayed at top of screen below search
- Filter by individual tags across all categories
- Multiple tag selection with AND logic (recipes must have ALL selected tags)
- Clear all filters functionality
- Visual indication of active filters
- Filter state persistence during session
- Integration with Tag Management System

### View Mode Management

- Toggle button to switch between grid and list views
- View preference persistence across app sessions
- Smooth transition animations between view modes
- Consistent navigation and functionality in both views

### Navigation Integration

- Tap recipe card navigates to Recipe Detail View
- Integration with Recipe CRUD Operations (FAB for adding recipes)
- Integration with Tag Management System (filter chips)
- Integration with Meal Planning (add to queue functionality)
- Seamless navigation flow between features

### Empty State Handling

- Simple "No recipes found" message when no recipes exist
- "No recipes found" message when search/filters return no results
- Differentiate between empty collection vs. filtered results
- Clear messaging to guide user actions

## Visual Design

### Layout Structure

```
┌─────────────────────────┐
│ [🔍 Search recipes...]   │
├─────────────────────────┤
│ [Tag] [Tag] [Tag] [+More]│
├─────────────────────────┤
│ [Grid] [List] [+ Add]    │
├─────────────────────────┤
│ ┌─────┐ ┌─────┐         │
│ │ IMG │ │ IMG │         │
│ │Title│ │Title│         │
│ │Time │ │Time │         │
│ └─────┘ └─────┘         │
│ ┌─────┐ ┌─────┐         │
│ │ IMG │ │ IMG │         │
│ │Title│ │Title│         │
│ │Time │ │Time │         │
│ └─────┘ └─────┘         │
└─────────────────────────┘
```

### Grid View Design

- 2-column layout with equal-width cards
- Larger thumbnail images for visual appeal
- Card height based on content
- Consistent spacing between cards
- Clean, modern card design

### List View Design

- Single-column layout
- Horizontal card layout with image on left
- Compact information display
- Consistent row height
- Efficient vertical space usage

### Search and Filtering Design

- Search bar with clear icon
- Filter chips with remove functionality
- Active state indication for filters
- Smooth animations for filter changes
- Consistent with app's design system

## Reusable Components

### Existing Code to Leverage

- **Database Schema**: Use Recipe interfaces from Local Storage Foundation spec (lib/db/schema/recipe.ts)
- **Database Service**: Leverage RecipeService operations (lib/db/services/recipe-service.ts)
- **UI Foundation**: Build on existing ThemedText, ThemedView components in components/ directory
- **Navigation Patterns**: Follow Expo Router file-based routing already configured in app/\_layout.tsx
- **Tab Navigation**: Replace existing HomeScreen content in app/(tabs)/index.tsx
- **UI Components**: Use React Native Reusables components and Nativewind styling

### New Components Required

- **RecipeRepositoryScreen**: Main screen component (app/(tabs)/index.tsx)
- **RecipeCard**: Reusable card component for both grid and list views
- **RecipeGrid**: Grid view layout component
- **RecipeList**: List view layout component
- **SearchBar**: Search input component with clear functionality
- **FilterChips**: Tag filtering component with chip display
- **ViewToggle**: Toggle button for switching between grid/list views
- **EmptyState**: Empty state component for no recipes/filtered results
- **RecipeCardGrid**: Grid-specific recipe card layout
- **RecipeCardList**: List-specific recipe card layout
- **PlaceholderImage**: Default image component for missing recipe images

## Technical Approach

### File Structure

```
app/
├── (tabs)/
│   └── index.tsx                    # Recipe repository screen (replaces HomeScreen)

components/
├── recipes/
│   ├── recipe-repository.tsx        # Main repository component
│   ├── recipe-card.tsx              # Base recipe card component
│   ├── recipe-card-grid.tsx         # Grid view recipe card
│   ├── recipe-card-list.tsx         # List view recipe card
│   ├── recipe-grid.tsx              # Grid layout component
│   ├── recipe-list.tsx              # List layout component
│   ├── search-bar.tsx               # Search input component
│   ├── filter-chips.tsx             # Tag filtering component
│   ├── view-toggle.tsx              # Grid/list toggle component
│   └── empty-state.tsx              # Empty state component
├── ui/
│   ├── button.tsx                   # Button component (React Native Reusables)
│   ├── input.tsx                    # Input component (React Native Reusables)
│   ├── chip.tsx                     # Chip component (React Native Reusables)
│   ├── fab.tsx                      # Floating action button
│   └── placeholder-image.tsx        # Placeholder image component

lib/
├── hooks/
│   └── use-recipe-repository.ts     # Custom hook for repository logic
├── utils/
│   └── recipe-formatter.ts          # Utility functions for recipe display
└── constants/
    └── view-modes.ts                # View mode constants and types
```

### Integration with Database Service Layer

- Import RecipeService from lib/db/services/recipe-service.ts
- Use RecipeService.getAllRecipes() for fetching recipes
- Implement pagination for infinite scroll
- Handle search queries efficiently with database filtering
- Filter recipes by tags using database queries
- Optimize queries for performance with large datasets
- Handle database errors with try-catch and display error states

### Search Implementation

- Real-time search with debounced input (300ms delay)
- Case-insensitive title search
- Search state management with React hooks
- Clear search functionality
- Search persistence during session
- Performance optimization for large recipe collections

### Tag Filtering Implementation

- Integration with Tag Management System
- Multiple tag selection with AND logic
- Filter chip display with remove functionality
- Active filter state management
- Filter persistence during session
- Efficient database queries for filtered results

### View Mode Management

- Grid/List view state management
- View preference persistence using AsyncStorage
- Smooth transition animations
- Consistent functionality across both views
- Performance optimization for view switching

### Infinite Scroll Implementation

- FlatList with onEndReached for pagination
- Lazy loading for recipe images
- Virtual scrolling for large lists
- Loading states for data fetching
- Error handling for failed loads
- Performance optimization for smooth scrolling

### Performance Optimization

- Lazy loading for recipe images
- Virtual scrolling for large lists
- Debounced search input
- Memoized recipe cards with React.memo
- Efficient re-rendering on view mode changes
- Image caching and optimization
- Pagination for large datasets

### State Management

- Search query state
- Active filter tags state
- View mode preference state
- Pagination state for infinite scroll
- Loading states for data fetching
- Error states for failed operations

### UI Components from React Native Reusables

- **Input**: Search bar input with clear functionality
- **Button**: View toggle buttons and action buttons
- **Chip**: Tag filter chips with remove functionality
- **FAB**: Floating action button for adding recipes
- **FlatList**: Recipe display with infinite scroll
- **Image**: Recipe thumbnail display with placeholder fallback

### Navigation Flows

**Main Flow:**
Recipe Repository Screen -> Tap Recipe Card -> Recipe Detail View

**Search Flow:**
Recipe Repository Screen -> Enter search query -> Filtered results -> Tap Recipe Card -> Recipe Detail View

**Filter Flow:**
Recipe Repository Screen -> Select filter tags -> Filtered results -> Tap Recipe Card -> Recipe Detail View

**Add Recipe Flow:**
Recipe Repository Screen -> Tap FAB "+" -> Recipe Form -> Save -> Return to Repository with new recipe

**View Mode Flow:**
Recipe Repository Screen -> Tap View Toggle -> Switch between Grid/List views

### Error Handling Strategy

- **Database Errors**: Show error state with retry option
- **Search Errors**: Display error message and allow user to retry
- **Filter Errors**: Show error state and reset filters
- **Image Loading Errors**: Display placeholder image
- **Network Errors**: Show offline state with retry functionality
- **Empty States**: Clear messaging for no recipes or filtered results

### Module Organization Pattern

- Group recipe repository components in components/recipes/ directory
- Repository logic in custom hook (use-recipe-repository.ts)
- Utility functions in lib/utils/
- Constants and types in lib/constants/
- Database operations abstracted through service layer
- Keep screen component focused on UI, logic in custom hook
- Reusable components for use across app

## Success Criteria

- Recipe repository loads and displays recipes in under 2 seconds
- Users can switch between grid and list views smoothly
- Search functionality returns results in real-time as user types
- Tag filtering works correctly with multiple tag selection
- Infinite scroll loads additional recipes seamlessly
- Recipe cards display all required information clearly
- Navigation to recipe detail view works from both grid and list views
- View preferences persist across app sessions
- Search and filter states persist during session
- Empty states display appropriate messages
- Performance remains smooth with large recipe collections (100+ recipes)
- Integration with other features (CRUD, Tag Management, Meal Planning) works seamlessly
- Zero crashes during repository operations in testing
- Images load efficiently with proper placeholder fallbacks
- All user interactions provide appropriate feedback

## Out of Scope (MVP)

- Advanced search (ingredients, source, instructions)
- Sorting options (by title, prep time, etc.)
- Recipe collections or folders
- Favorites or starred recipes
- Recipe sharing functionality
- Bulk operations (multi-select, bulk delete)
- Recipe duplication
- Advanced filtering (date ranges, cooking time ranges)
- Recipe recommendations
- Recently viewed recipes
- Recipe statistics or analytics
- Custom view layouts beyond grid/list
- Drag-and-drop reordering
- Recipe comparison features
- Export or backup functionality
- Recipe rating or review system
- Social features or community integration
- Recipe import from external sources
- Advanced image viewing with zoom
- Recipe notes or personal annotations
- Recipe versioning or history
- Collaborative features
- Offline sync capabilities
- Recipe backup and restore
- Advanced search filters
- Recipe templates or presets

## Future Enhancements (Phase 2+)

- Advanced search and filtering (Phase 2)
- Sorting options (Phase 2)
- Recipe collections and folders (Phase 2)
- Favorites system (Phase 2)
- Recently viewed recipes (Phase 2)
- Recipe recommendations (Phase 3)
- Advanced analytics and insights (Phase 3)
- Custom view layouts (Phase 3)
- Drag-and-drop functionality (Phase 3)
- Recipe sharing and collaboration (Phase 3)
- Advanced image viewing (Phase 2)
- Recipe import from URLs (Phase 2)
- Recipe templates and presets (Phase 2)
- Advanced search filters (Phase 2)
- Recipe statistics and insights (Phase 3)
- Social features and community (Phase 3)
- Offline sync and backup (Phase 3)
- Recipe versioning and history (Phase 3)
- Collaborative recipe editing (Phase 3)
- AI-powered recipe recommendations (Phase 3)
- Recipe nutrition analysis (Phase 3)
- Recipe cost analysis (Phase 3)
- Recipe difficulty ratings (Phase 2)
- Recipe preparation time estimates (Phase 2)
- Recipe serving size suggestions (Phase 2)
- Recipe ingredient substitutions (Phase 3)
- Recipe cooking tips and techniques (Phase 3)
- Recipe video integration (Phase 3)
- Recipe voice notes (Phase 3)
- Recipe barcode scanning (Phase 3)
- Recipe QR code generation (Phase 3)


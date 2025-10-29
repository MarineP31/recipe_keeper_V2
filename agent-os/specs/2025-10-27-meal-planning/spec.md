# Specification: Meal Planning (Recipe Queue)

## Goal
Enable users to plan meals using a simplified chronological recipe queue where they can add multiple recipes, view them in order, mark them as cooked, and automatically generate shopping lists from queued recipes.

## User Stories
- As a user, I want to add multiple recipes to a meal queue so that I can plan what I'll cook next
- As a user, I want to see which recipes are in my queue so that I can remember what I planned to cook
- As a user, I want to mark recipes as cooked to remove them from my queue
- As a user, I want to see if a recipe is already in my queue when viewing recipe details
- As a user, I want to generate a shopping list from all my queued recipes so that I can buy ingredients for my planned meals

## Core Requirements

### Recipe Queue Management
- Users can add recipes to a queue in chronological order (FIFO - first added appears first)
- Queue displays recipes as vertical scrollable list of recipe cards
- Each recipe card shows thumbnail image, title, prep time, cook time, and servings
- No manual reordering capability (chronological order based on when added)
- No date assignments or meal type categorization
- Prevent duplicate recipes in queue (show indicator if already queued)

### Adding Recipes to Queue
- Multi-select mode on recipe list view allowing batch selection
- Multi-select mode activated via header button or long-press on recipe card
- Visual checkboxes appear on recipe cards when in multi-select mode
- "Add to Queue" action button appears when recipes selected
- Batch add operation adds all selected recipes simultaneously
- Visual indicator on recipe cards showing which recipes are already queued
- Single add from recipe detail view (add current recipe to queue)

### Queue Display
- Dedicated queue screen accessible via tab navigation
- Simple vertical FlatList of recipe cards in chronological order
- Each card displays recipe information and action buttons
- Empty state message: "No recipes in your queue. Add recipes to get started!"
- Pull-to-refresh to reload queue

### Completing and Removing Recipes
- "Mark as Cooked" button on each recipe card in queue
- Individual "Remove" button on each recipe card (trash icon)
- "Mark as Cooked" immediately removes recipe from queue (no history tracking)
- Confirmation dialog for remove action: "Remove [Recipe Title] from queue?"
- Toast notification after marking as cooked or removing
- No "Recently Cooked" history in this MVP

### Shopping List Integration
- ALL recipes currently in queue automatically included in shopping list
- Shopping list aggregates ingredients from all queued recipes
- Duplicate ingredients combined with summed quantities
- Unit normalization for aggregation (cups, tbsp, oz, etc.)
- Removing recipe from queue removes its ingredients from shopping list
- No selective inclusion/exclusion checkboxes (all-or-nothing approach)

### Recipe Detail Integration
- Visual badge/indicator on recipe detail view showing "In Queue" status
- "Add to Queue" button on recipe detail view when not queued
- "Remove from Queue" button on recipe detail view when already queued
- Button state updates immediately after queue changes

## Visual Design
No visual mockups provided. Implementation should follow:
- React Native Reusables component design system
- Nativewind utility styling
- Recipe card design consistent with recipe list view
- Tab navigation pattern following existing app structure
- Action buttons with clear icons (checkmark for "Mark as Cooked", trash for remove)

## Reusable Components

### Existing Code to Leverage
- **Recipe Card Component**: Reuse from Recipe CRUD Operations (components/recipes/) for queue display
- **Recipe List View**: Extend existing recipe list with multi-select mode
- **Database Service Layer**: Follow patterns from RecipeService (lib/db/services/recipe-service.ts)
- **Navigation Pattern**: Use Expo Router tabs following app/(tabs)/_layout.tsx structure
- **UI Components**: Button, Card, Badge, Toast from React Native Reusables (components/ui/)
- **TypeScript Types**: Recipe interface from lib/db/schema/recipe.ts
- **Validation Pattern**: Zod schemas following established database validation approach

### New Components Required
- **Recipe Queue Service**: New service for queue CRUD operations (lib/db/services/queue-service.ts)
- **Queue Screen**: New tab screen for queue list view (app/(tabs)/queue.tsx)
- **Multi-Select Mode**: Enhancement to recipe list view component for checkbox selection
- **Queue Badge Component**: Visual indicator showing "In Queue" status
- **Shopping List Aggregation Logic**: Algorithm to combine ingredients from multiple recipes
- **Queue Context Provider**: React Context for queue state management across app

## Technical Approach

### Database Schema

**Recommended Approach: Create dedicated `recipe_queue` table**

Rationale: The existing `meal_plans` table includes `date` and `mealType` fields designed for calendar-based planning. For a simple chronological queue, these fields would be unused, creating semantic mismatch. A dedicated table provides clarity and simplicity for MVP.

**recipe_queue table:**
```sql
CREATE TABLE recipe_queue (
  id TEXT PRIMARY KEY,           -- UUID
  recipeId TEXT NOT NULL,        -- Foreign key to recipes.id
  createdAt TEXT NOT NULL,       -- ISO 8601 datetime, used for chronological ordering
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_recipe_queue_recipeId ON recipe_queue(recipeId);
CREATE INDEX idx_recipe_queue_createdAt ON recipe_queue(createdAt);
```

Key design decisions:
- UNIQUE constraint on recipeId prevents duplicate recipes in queue
- CASCADE delete removes queue entries when recipe deleted
- Index on createdAt for fast chronological ordering
- Simple schema with only essential fields (no date, mealType, servings override)

### Service Layer

**lib/db/services/queue-service.ts:**
```typescript
// Core operations
addToQueue(recipeId: string): Promise<QueueItem>
addMultipleToQueue(recipeIds: string[]): Promise<QueueItem[]>
removeFromQueue(queueItemId: string): Promise<void>
removeRecipeFromQueue(recipeId: string): Promise<void>
getQueuedRecipes(): Promise<Recipe[]>
isRecipeInQueue(recipeId: string): Promise<boolean>
clearQueue(): Promise<void>
markAsCooked(queueItemId: string): Promise<void> // Alias for removeFromQueue
```

**TypeScript Interface:**
```typescript
interface QueueItem {
  id: string;
  recipeId: string;
  createdAt: string;
}

interface QueuedRecipe extends Recipe {
  queueItemId: string; // For direct removal operations
}
```

**Service Implementation Notes:**
- Use transactions for batch operations (addMultipleToQueue)
- Join recipe_queue with recipes table to return full recipe data
- Filter out soft-deleted recipes (WHERE recipes.deletedAt IS NULL)
- Order results by recipe_queue.createdAt ASC for chronological display
- Handle duplicate prevention with UNIQUE constraint catch

### UI Component Structure

**File Organization:**
```
app/
├── (tabs)/
│   ├── queue.tsx                   # Queue screen (new tab)
│   └── _layout.tsx                 # Update to include queue tab
│
components/
├── recipes/
│   ├── recipe-card.tsx             # Existing, extend with queue badge
│   ├── recipe-list-multi-select.tsx # Multi-select wrapper for recipe list
│   └── queue-recipe-card.tsx       # Recipe card variant for queue view
├── queue/
│   ├── queue-empty-state.tsx       # Empty queue placeholder
│   ├── queue-badge.tsx             # "In Queue" indicator
│   └── mark-cooked-button.tsx      # Action button component
│
lib/
├── contexts/
│   └── queue-context.tsx           # Global queue state management
├── hooks/
│   ├── use-queue.ts                # Hook for queue operations
│   └── use-multi-select.ts         # Hook for multi-select state
```

### Queue Context and State Management

**lib/contexts/queue-context.tsx:**
```typescript
interface QueueContextType {
  queuedRecipeIds: Set<string>;
  queuedRecipes: QueuedRecipe[];
  isLoading: boolean;
  addToQueue: (recipeId: string) => Promise<void>;
  addMultipleToQueue: (recipeIds: string[]) => Promise<void>;
  removeFromQueue: (recipeId: string) => Promise<void>;
  markAsCooked: (queueItemId: string) => Promise<void>;
  isInQueue: (recipeId: string) => boolean;
  refreshQueue: () => Promise<void>;
}
```

Key features:
- Maintain Set of queued recipe IDs for fast O(1) lookup
- Cache full queued recipes list for queue screen display
- Expose operations as async functions with optimistic updates
- Automatically refresh after mutations
- Use React Context to share state across screens

### Multi-Select Mode Implementation

**Recipe List View Enhancement:**
- Add state: `multiSelectMode: boolean` and `selectedRecipeIds: Set<string>`
- Toggle multi-select mode via header button (icon: checkmark.circle)
- Long-press on recipe card as alternative activation
- Show checkboxes on recipe cards when multiSelectMode = true
- Disable queue badge visibility in multi-select mode
- Display floating action bar at bottom with "Add to Queue" button and selected count
- Clear selections after successful batch add
- Exit multi-select mode after add operation or via cancel button

**Visual States:**
- Normal mode: Recipe cards display queue badge if applicable
- Multi-select mode: Checkboxes appear, queue badges hidden
- Selected state: Checkbox filled, card highlight border
- Already queued: Show info badge, disable checkbox

### Queue Screen Layout

**app/(tabs)/queue.tsx Structure:**
- FlatList rendering QueuedRecipe items
- Pull-to-refresh with refreshQueue()
- Empty state when queuedRecipes.length === 0
- Each item renders queue-recipe-card component
- Optional: Header with "Clear All" button (with confirmation)
- Recipe cards tappable to navigate to recipe detail view

**Queue Recipe Card:**
- Recipe thumbnail image (150x150 aspect ratio)
- Recipe title (truncated to 2 lines)
- Prep time + Cook time display
- Servings count
- Two action buttons:
  - "Mark as Cooked" (primary, checkmark icon)
  - "Remove" (secondary, trash icon)
- Swipe-to-remove gesture (optional enhancement)

### Navigation Flows

**Add to Queue from Recipe List:**
1. Recipe List Screen → Activate multi-select mode (header button or long-press)
2. Select one or more recipes (checkboxes)
3. Tap "Add to Queue" in floating action bar
4. Toast: "[X] recipes added to queue"
5. Exit multi-select mode, refresh recipe list to show queue badges

**Add to Queue from Recipe Detail:**
1. Recipe Detail Screen → Tap "Add to Queue" button
2. Button changes to "Remove from Queue"
3. Toast: "[Recipe Title] added to queue"
4. Queue badge appears on detail view

**Mark as Cooked:**
1. Queue Screen → Tap "Mark as Cooked" on recipe card
2. Recipe immediately removed from list with animation
3. Toast: "[Recipe Title] marked as cooked"
4. Shopping list automatically updates

**Remove from Queue:**
1. Queue Screen → Tap "Remove" button
2. Confirmation dialog: "Remove [Recipe Title] from queue?"
3. Confirm → Recipe removed from list
4. Toast: "[Recipe Title] removed from queue"

**Navigate to Recipe Detail from Queue:**
1. Queue Screen → Tap anywhere on recipe card (not on action buttons)
2. Navigate to Recipe Detail Screen with recipe ID
3. Show "Remove from Queue" button in detail view

### Shopping List Integration

**lib/services/shopping-list-generator.ts:**
```typescript
generateShoppingListFromQueue(): Promise<ShoppingListItem[]>
aggregateIngredients(recipes: Recipe[]): AggregatedIngredient[]
normalizeUnit(unit: MeasurementUnit): string
combineQuantities(items: Ingredient[]): number
```

**Aggregation Algorithm:**
1. Fetch all recipes in queue via QueueService.getQueuedRecipes()
2. Extract all ingredients from each recipe
3. Group ingredients by normalized name (lowercase, trim whitespace)
4. For each ingredient group:
   - If units match, sum quantities
   - If units incompatible, create separate line items
   - If no quantity, list as "[ingredient name] (from [recipe name])"
5. Create ShoppingListItem entries with recipeId references
6. Mark all as unchecked initially

**Unit Normalization:**
- Convert similar units: tsp/teaspoon, tbsp/tablespoon, oz/ounce
- Handle volume to weight conversions where possible (cups to ml)
- When ambiguous, keep separate line items with note

**Automatic Updates:**
- Shopping list regenerates when queue changes (add/remove recipe)
- Debounce regeneration to avoid rapid successive updates
- Preserve checked state for existing items when regenerating
- Clear items linked to removed recipes

### Tab Navigation Integration

**Update app/(tabs)/_layout.tsx:**
```typescript
<Tabs.Screen
  name="queue"
  options={{
    title: 'Queue',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
    tabBarBadge: queueCount > 0 ? queueCount : undefined,
  }}
/>
```

Tab position: Place between "Recipes" and "Shopping List" tabs for logical workflow.

### Performance Considerations
- Use FlatList with keyExtractor for queue rendering (virtualization)
- Cache queuedRecipeIds Set in context to avoid repeated database queries
- Index on recipe_queue.recipeId for fast duplicate checking
- Index on recipe_queue.createdAt for fast chronological ordering
- Debounce shopping list regeneration (500ms delay after queue change)
- Optimistic UI updates for add/remove operations
- Batch database inserts for addMultipleToQueue operation

### Error Handling
- Duplicate recipe add: Show toast "Recipe already in queue"
- Database errors: Display error toast with retry option
- Queue operations fail: Rollback optimistic updates, show error
- Empty queue actions: Disable "Clear All" when queue empty
- Recipe deletion: Cascade delete queue entries automatically
- Permission errors: N/A (local database only)

### Validation
- Validate recipeId exists before adding to queue
- Validate recipe not soft-deleted (deletedAt IS NULL)
- Validate queueItemId exists before removal
- Use Zod schema for QueueItem validation matching database schema

## Success Criteria
- User can add multiple recipes to queue in under 10 seconds using multi-select mode
- Queue displays recipes in correct chronological order (FIFO)
- "Mark as Cooked" immediately removes recipe from queue with confirmation toast
- Queue membership indicator displays accurately on recipe list and detail views
- Shopping list automatically generates from all queued recipes with ingredient aggregation
- All queue operations complete in under 500ms for typical usage (10 recipes in queue)
- No duplicate recipes allowed in queue (enforced by database constraint)
- Tab badge shows accurate count of recipes in queue
- Multi-select mode activates smoothly with visual feedback
- Queue state persists across app restarts (database persistence)
- Removing recipe from app also removes from queue (cascade delete)

## Out of Scope
- Calendar-based meal planning with date assignments (deferred to future calendar feature)
- Meal type categorization (breakfast/lunch/dinner/snack slots)
- Visual calendar interface or date picker
- Drag-and-drop manual reordering of queue items
- Per-queue-item servings adjustment (always use recipe default servings)
- Recipe notes or modifications specific to queued items
- "Recently Cooked" history tracking or completion log
- Meal plan templates or recurring weekly plans
- Weekly/monthly view of planned meals
- Past meal plan history or analytics
- Queue sharing or collaborative planning
- Queue import/export functionality
- Cooking timers or cooking mode integration
- Nutritional information for queued meals
- Budget or cost tracking for meal plans
- Grocery store aisle organization
- Recipe substitutions in queue context
- Leftover tracking or meal prep notes

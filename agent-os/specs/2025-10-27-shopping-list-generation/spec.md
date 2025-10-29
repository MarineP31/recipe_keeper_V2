# Specification: Shopping List Generation

## Goal
Automatically generate and manage shopping lists from all recipes in the user's queue with intelligent ingredient aggregation, unit conversion, category grouping, and manual item support, enabling efficient grocery shopping with check-off functionality.

## User Stories
- As a user, I want an automatically generated shopping list from all my queued recipes so that I know what ingredients to purchase
- As a user, I want duplicate ingredients combined with summed quantities so that I buy the correct total amount
- As a user, I want ingredients organized by category so that shopping is efficient and follows store layout
- As a user, I want to check off items as I shop so that I can track what I've purchased
- As a user, I want to add manual items to my shopping list so that I can include non-recipe items like household goods
- As a user, I want the shopping list to update automatically when I modify my recipe queue so that it stays accurate

## Core Requirements

### Automatic List Generation
- Generate shopping list from ALL recipes currently in the queue (no opt-out per recipe)
- Aggregate ingredients across all queued recipes into single consolidated list
- Normalize ingredient names to detect duplicates (case-insensitive, singular/plural handling)
- Sum quantities for duplicate ingredients with compatible units
- Perform unit conversions to combine compatible measurements (tbsp to cups, oz to lbs, etc.)
- Display aggregated quantity in most appropriate unit (e.g., 16 tbsp displays as 1 cup)
- Preserve manual items separately from recipe-generated items

### Ingredient Aggregation Algorithm
- Extract all ingredients from queued recipes
- Normalize ingredient names: lowercase, trim whitespace, handle singular/plural forms
- Group ingredients by normalized name
- For each ingredient group:
  - If units are identical, sum quantities directly
  - If units are compatible (volume to volume, weight to weight), convert and sum
  - If units are incompatible or missing, create separate line items
  - Store original recipe references for traceability
- Track which recipes contribute to each aggregated ingredient

### Unit Conversion System
- Implement conversion mappings for common cooking units:
  - Volume: tsp, tbsp, cups, fl oz, ml, liters (1 cup = 16 tbsp = 48 tsp = 8 fl oz = 237 ml)
  - Weight: oz, lbs, grams, kg (1 lb = 16 oz = 454 g)
  - Count: unit (no conversion)
- Convert to common base unit for aggregation, then display in most readable format
- Handle edge cases: ingredients without quantities (display as "some [ingredient]")
- Preserve original unit when no conversion possible

### Category Inference
- Assign category to each ingredient for grouping:
  - Produce (vegetables, fruits)
  - Dairy (milk, cheese, yogurt, butter)
  - Meat & Seafood (chicken, beef, fish, shrimp)
  - Pantry (flour, sugar, spices, oils, canned goods)
  - Frozen (frozen vegetables, ice cream)
  - Bakery (bread, tortillas)
  - Other (catch-all for unclassified items)
- Use keyword matching approach: maintain predefined mapping of ingredient names to categories
- Default to "Other" category if no match found
- Manual items default to "Other" unless user specifies category

### Check-off Functionality
- Each shopping list item has boolean checked state (default: unchecked)
- User can tap checkbox to toggle checked/unchecked state
- Checked items display with strikethrough text styling
- Checked items remain visible in list (not hidden or removed)
- Persist checked state in database
- Check-off state updates immediately with optimistic UI

### Manual Item Addition
- Support adding items not from recipes (household items, snacks, personal care)
- Manual items have:
  - Name (required)
  - Quantity (optional)
  - Unit (optional)
  - Category (defaults to "Other")
  - Checked state (default: unchecked)
- Manual items persist through queue regeneration (flagged as source: "manual")
- Manual items can be deleted individually
- Manual items checked state independent of recipe items

### List Regeneration and Synchronization
- Trigger regeneration when:
  - Recipe added to queue
  - Recipe removed from queue
  - Recipe marked as cooked (immediate removal from queue)
- Regeneration behavior:
  - Delete all recipe-generated items (source: "recipe")
  - Preserve all manual items (source: "manual")
  - Reset all recipe-generated items to unchecked state
  - Preserve manual items checked state
  - Re-aggregate ingredients from current queue
  - Create new shopping list items
- Real-time sync: shopping list updates immediately when queue changes
- Debounce regeneration (500ms) to handle rapid queue modifications

### Shopping List Display
- Organized by category with section headers
- Category order: Produce, Dairy, Meat & Seafood, Pantry, Frozen, Bakery, Other
- Within each category, alphabetical sorting by ingredient name
- Display format for each item:
  - Checkbox (checked/unchecked state)
  - Ingredient name (bold)
  - Quantity and unit (smaller text)
  - Strikethrough when checked
- Empty state: "Your shopping list is empty. Add recipes to your queue to get started!"
- Pull-to-refresh to manually trigger regeneration

## Visual Design
No visual mockups provided. Implementation should follow standard mobile shopping list patterns:
- Clean, scannable vertical list layout
- Clear category section headers with background color
- Large tap targets for checkboxes (minimum 44x44 points)
- Strikethrough styling for checked items
- Readable typography with hierarchy (item name prominent, quantity secondary)
- "Add Item" button at bottom or floating action button for manual additions
- React Native Reusables component system
- Nativewind utility styling

## Reusable Components

### Existing Code to Leverage
- **Database Schema**: Use existing shopping_list_items table from Local Storage Foundation spec
- **Recipe Service**: Leverage RecipeService to fetch queued recipes (lib/db/services/recipe-service.ts)
- **Queue Service**: Use QueueService to monitor queue changes (lib/db/services/queue-service.ts)
- **Ingredient Type**: Reuse Ingredient interface from Recipe schema (lib/db/schema/recipe.ts)
- **MeasurementUnit Enum**: Use existing MeasurementUnit enum from constants/enums.ts
- **Navigation Pattern**: Follow Expo Router tabs structure (app/(tabs)/_layout.tsx)
- **UI Components**: Checkbox, Button, Card from React Native Reusables (components/ui/)
- **TypeScript Config**: Use strict mode TypeScript with existing validation patterns
- **Queue Context**: Leverage QueueContext for queue state monitoring (lib/contexts/queue-context.tsx)

### New Components Required
- **Shopping List Service**: New service for CRUD operations on shopping list items (lib/db/services/shopping-list-service.ts)
- **Ingredient Aggregator**: Algorithm to normalize, group, and aggregate ingredients (lib/services/ingredient-aggregator.ts)
- **Unit Converter**: Utility for unit conversion logic (lib/utils/unit-converter.ts)
- **Category Classifier**: Ingredient to category mapping logic (lib/utils/category-classifier.ts)
- **Name Normalizer**: Ingredient name normalization (lib/utils/ingredient-normalizer.ts)
- **Shopping List Screen**: Main shopping list view with categories (app/(tabs)/shopping-list.tsx)
- **Shopping List Item Component**: Individual item with checkbox (components/shopping-list/shopping-list-item.tsx)
- **Category Section Component**: Category header and items (components/shopping-list/category-section.tsx)
- **Manual Item Form**: Dialog/modal for adding manual items (components/shopping-list/add-manual-item-dialog.tsx)
- **Shopping List Context**: React Context for shopping list state management (lib/contexts/shopping-list-context.tsx)

## Technical Approach

### Database Schema Usage

**shopping_list_items table (from Local Storage Foundation):**
```sql
CREATE TABLE shopping_list_items (
  id TEXT PRIMARY KEY,              -- UUID
  name TEXT NOT NULL,               -- Ingredient name (normalized)
  quantity REAL NULL,               -- Numeric amount
  unit TEXT NULL,                   -- MeasurementUnit enum
  checked INTEGER NOT NULL DEFAULT 0, -- Boolean as 0/1
  recipeId TEXT NULL,               -- Foreign key to recipes.id, null for manual
  mealPlanId TEXT NULL,             -- Legacy field (not used in MVP queue approach)
  category TEXT NOT NULL,           -- Category for grouping
  source TEXT NOT NULL,             -- 'recipe' or 'manual'
  originalName TEXT NULL,           -- Original ingredient name before normalization
  createdAt TEXT NOT NULL,          -- ISO 8601 datetime
  INDEX: (checked),
  INDEX: (category),
  INDEX: (source)
);
```

**Schema Extensions Needed:**
- Add `category` column: TEXT NOT NULL DEFAULT 'Other'
- Add `source` column: TEXT NOT NULL DEFAULT 'recipe' (values: 'recipe' or 'manual')
- Add `originalName` column: TEXT NULL (preserve original before normalization)
- Create index on category for fast grouping queries
- Create index on source for filtering recipe vs manual items

**Migration Required:**
- Create migration file: lib/db/migrations/003_add_shopping_list_fields.ts
- Add columns with ALTER TABLE statements
- Create new indexes
- Backfill existing data with default values

### Service Layer Architecture

**lib/db/services/shopping-list-service.ts:**
```typescript
// Core CRUD operations
createItem(item: CreateShoppingListItemInput): Promise<ShoppingListItem>
createBulk(items: CreateShoppingListItemInput[]): Promise<ShoppingListItem[]>
getAll(): Promise<ShoppingListItem[]>
getAllByCategory(): Promise<GroupedShoppingListItems>
updateCheckedState(id: string, checked: boolean): Promise<void>
deleteItem(id: string): Promise<void>
deleteBySource(source: 'recipe' | 'manual'): Promise<void>
deleteByRecipeId(recipeId: string): Promise<void>
clearAll(): Promise<void>
```

**lib/services/shopping-list-generator.ts:**
```typescript
// High-level shopping list generation
generateFromQueue(): Promise<ShoppingListItem[]>
regenerateList(): Promise<ShoppingListItem[]>
addManualItem(item: ManualItemInput): Promise<ShoppingListItem>
```

**TypeScript Interfaces:**
```typescript
interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  checked: boolean;
  recipeId: string | null;
  category: string;
  source: 'recipe' | 'manual';
  originalName: string | null;
  createdAt: string;
}

interface GroupedShoppingListItems {
  [category: string]: ShoppingListItem[];
}

interface CreateShoppingListItemInput {
  name: string;
  quantity?: number;
  unit?: MeasurementUnit;
  recipeId?: string;
  category: string;
  source: 'recipe' | 'manual';
  originalName?: string;
}

interface ManualItemInput {
  name: string;
  quantity?: number;
  unit?: MeasurementUnit;
  category?: string;
}
```

### Ingredient Aggregation Algorithm

**lib/services/ingredient-aggregator.ts:**

**Core aggregation flow:**
1. Fetch all recipes in queue via QueueService.getQueuedRecipes()
2. Extract ingredients array from each recipe
3. Normalize each ingredient name using IngredientNormalizer
4. Group ingredients by normalized name
5. For each group:
   - Check if all units are compatible
   - Convert all quantities to common base unit
   - Sum converted quantities
   - Convert sum to most appropriate display unit
   - Create aggregated ShoppingListItem with references to source recipes
6. Classify category for each aggregated ingredient
7. Return array of ShoppingListItem objects

**Normalization strategy:**
```typescript
normalizeIngredientName(name: string): string {
  // Convert to lowercase
  let normalized = name.toLowerCase().trim();

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  // Handle common plural/singular patterns
  // eggs -> egg, tomatoes -> tomato, onions -> onion
  const pluralMap = {
    'eggs': 'egg',
    'tomatoes': 'tomato',
    'onions': 'onion',
    'potatoes': 'potato',
    'carrots': 'carrot',
    // ... more mappings
  };

  if (pluralMap[normalized]) {
    normalized = pluralMap[normalized];
  }

  // Remove common descriptors while preserving key terms
  // "extra virgin olive oil" -> "olive oil"
  // "fresh basil" -> "basil"
  // Keep prepositions/specificity when meaningful

  return normalized;
}
```

### Unit Conversion Implementation

**lib/utils/unit-converter.ts:**

**Conversion tables:**
```typescript
const VOLUME_CONVERSIONS = {
  tsp: 1,
  tbsp: 3,        // 1 tbsp = 3 tsp
  cup: 48,        // 1 cup = 48 tsp
  'fl oz': 6,     // 1 fl oz = 6 tsp
  ml: 0.202884,   // 1 ml = 0.202884 tsp
  l: 202.884,     // 1 liter = 202.884 tsp
};

const WEIGHT_CONVERSIONS = {
  oz: 1,
  lb: 16,         // 1 lb = 16 oz
  g: 0.035274,    // 1 g = 0.035274 oz
  kg: 35.274,     // 1 kg = 35.274 oz
};

function convertToBaseUnit(quantity: number, unit: MeasurementUnit): { value: number, type: 'volume' | 'weight' | 'count' } {
  if (VOLUME_CONVERSIONS[unit]) {
    return { value: quantity * VOLUME_CONVERSIONS[unit], type: 'volume' };
  }
  if (WEIGHT_CONVERSIONS[unit]) {
    return { value: quantity * WEIGHT_CONVERSIONS[unit], type: 'weight' };
  }
  return { value: quantity, type: 'count' };
}

function convertToDisplayUnit(value: number, type: 'volume' | 'weight'): { quantity: number, unit: MeasurementUnit } {
  if (type === 'volume') {
    if (value >= 48) return { quantity: value / 48, unit: 'cup' };
    if (value >= 3) return { quantity: value / 3, unit: 'tbsp' };
    return { quantity: value, unit: 'tsp' };
  }
  if (type === 'weight') {
    if (value >= 16) return { quantity: value / 16, unit: 'lb' };
    return { quantity: value, unit: 'oz' };
  }
  return { quantity: value, unit: 'unit' };
}
```

**Aggregation with conversion:**
```typescript
function aggregateIngredients(ingredients: Ingredient[]): AggregatedIngredient {
  const baseConversions = ingredients.map(ing => {
    if (!ing.quantity || !ing.unit) return null;
    return convertToBaseUnit(ing.quantity, ing.unit);
  }).filter(Boolean);

  // Check all same type (volume or weight)
  const types = baseConversions.map(c => c.type);
  if (new Set(types).size > 1) {
    // Incompatible units, keep separate
    return createSeparateItems(ingredients);
  }

  // Sum base values
  const total = baseConversions.reduce((sum, c) => sum + c.value, 0);

  // Convert to display unit
  const { quantity, unit } = convertToDisplayUnit(total, types[0]);

  return { quantity, unit };
}
```

### Category Classification

**lib/utils/category-classifier.ts:**

**Keyword-based classification:**
```typescript
const CATEGORY_KEYWORDS = {
  'Produce': [
    'tomato', 'onion', 'garlic', 'lettuce', 'spinach', 'carrot', 'potato',
    'celery', 'pepper', 'cucumber', 'zucchini', 'broccoli', 'cauliflower',
    'apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'avocado',
    'mushroom', 'herbs', 'basil', 'cilantro', 'parsley', 'thyme', 'rosemary'
  ],
  'Dairy': [
    'milk', 'cream', 'cheese', 'butter', 'yogurt', 'sour cream',
    'cheddar', 'mozzarella', 'parmesan', 'feta', 'ricotta'
  ],
  'Meat & Seafood': [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'sausage',
    'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'scallop'
  ],
  'Pantry': [
    'flour', 'sugar', 'salt', 'pepper', 'oil', 'olive oil', 'vegetable oil',
    'rice', 'pasta', 'noodle', 'bean', 'lentil', 'quinoa', 'oat',
    'vinegar', 'soy sauce', 'sauce', 'stock', 'broth', 'canned',
    'spice', 'cinnamon', 'cumin', 'paprika', 'chili powder', 'oregano',
    'baking powder', 'baking soda', 'yeast', 'vanilla', 'cocoa', 'chocolate'
  ],
  'Frozen': [
    'frozen', 'ice cream', 'popsicle', 'frozen vegetables', 'frozen fruit'
  ],
  'Bakery': [
    'bread', 'baguette', 'roll', 'bun', 'tortilla', 'pita', 'bagel',
    'croissant', 'muffin', 'cake', 'cookie'
  ]
};

function classifyIngredient(ingredientName: string): string {
  const normalized = ingredientName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}
```

### State Management with Context

**lib/contexts/shopping-list-context.tsx:**

```typescript
interface ShoppingListContextType {
  items: GroupedShoppingListItems;
  isLoading: boolean;
  error: string | null;
  toggleItemChecked: (id: string) => Promise<void>;
  addManualItem: (item: ManualItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  regenerateList: () => Promise<void>;
  refreshList: () => Promise<void>;
}

// Implementation notes:
// - Subscribe to QueueContext for queue changes
// - Automatically trigger regenerateList when queue changes
// - Debounce regeneration (500ms) to handle rapid changes
// - Cache grouped items for performance
// - Optimistic updates for toggle operations
// - Error handling with retry capability
```

### UI Component Structure

**File Organization:**
```
app/
├── (tabs)/
│   ├── shopping-list.tsx              # Shopping list screen (new tab)
│   └── _layout.tsx                    # Update to include shopping-list tab

components/
├── shopping-list/
│   ├── shopping-list-item.tsx         # Individual item with checkbox
│   ├── category-section.tsx           # Category header + items
│   ├── add-manual-item-dialog.tsx     # Modal for manual item entry
│   └── empty-shopping-list.tsx        # Empty state component

lib/
├── services/
│   ├── shopping-list-generator.ts     # High-level generation logic
│   └── ingredient-aggregator.ts       # Aggregation algorithm
├── utils/
│   ├── unit-converter.ts              # Unit conversion functions
│   ├── category-classifier.ts         # Category mapping
│   └── ingredient-normalizer.ts       # Name normalization
├── contexts/
│   └── shopping-list-context.tsx      # Global shopping list state
├── hooks/
│   └── use-shopping-list.ts           # Hook for shopping list operations
```

### Shopping List Screen Implementation

**app/(tabs)/shopping-list.tsx:**
- SectionList component rendering categories
- Pull-to-refresh with refreshList()
- Empty state when items empty
- Floating "Add Item" button for manual entries
- Header with optional "Clear All" button (confirmation required)
- Each section: CategorySection component with items array

**Category Section Component:**
- Section header with category name and item count
- FlatList of ShoppingListItem components
- Alphabetical sorting within category
- Collapsible sections (optional enhancement)

**Shopping List Item Component:**
- Checkbox (large tap target 44x44)
- Item name (bold, primary text)
- Quantity and unit (smaller, secondary text)
- Strikethrough styling when checked
- Swipe-to-delete gesture for manual items
- Disable delete for recipe-generated items (remove via queue instead)

### Navigation and Tab Integration

**Update app/(tabs)/_layout.tsx:**
```typescript
<Tabs.Screen
  name="shopping-list"
  options={{
    title: 'Shopping',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
  }}
/>
```

Tab order: Home -> Recipes -> Queue -> Shopping List -> Explore

### Regeneration Trigger Implementation

**Automatic regeneration on queue changes:**
1. ShoppingListContext subscribes to QueueContext
2. useEffect monitors queuedRecipeIds changes
3. Debounced regeneration function (500ms delay)
4. Regeneration flow:
   - Call ShoppingListService.deleteBySource('recipe')
   - Preserve manual items (source = 'manual')
   - Call ShoppingListGenerator.generateFromQueue()
   - Insert new recipe-generated items
   - Refresh UI with updated grouped items

**Manual regeneration:**
- Pull-to-refresh gesture on shopping list screen
- Explicit "Refresh" button in header (optional)

### Performance Optimizations

- Index on shopping_list_items.category for fast grouping queries
- Index on shopping_list_items.source for filtering
- Cache normalized ingredient names to avoid repeated computation
- Debounce regeneration (500ms) to batch queue changes
- Use SectionList virtualization for large shopping lists
- Optimistic UI updates for check/uncheck operations
- Batch database inserts for aggregated ingredients (single transaction)

### Error Handling

- Database errors: Display error toast with retry option
- Regeneration failures: Rollback to previous state, show error
- Unit conversion errors: Keep ingredients separate if conversion fails
- Empty queue: Display empty state, no error
- Manual item validation: Require name field, validate unit enum
- Duplicate manual items: Allow duplicates (user's choice)

### Validation

**Zod Schema for Manual Item Input:**
```typescript
const ManualItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  quantity: z.number().positive().optional(),
  unit: z.enum(MeasurementUnit).optional(),
  category: z.string().optional(),
});
```

**Business Logic Validation:**
- Validate recipe exists before adding to shopping list
- Validate queue not empty before generation
- Validate item ID exists before delete/update
- Validate source field is 'recipe' or 'manual'

## Success Criteria

- Shopping list automatically generates from all queued recipes in under 2 seconds for 10 recipes
- Duplicate ingredients correctly aggregated with proper unit conversion (e.g., 8 tbsp + 8 tbsp = 1 cup)
- Ingredient name normalization detects duplicates across case and plural variations
- Items grouped by category in consistent, logical order
- Check-off functionality updates immediately with strikethrough styling
- Manual items persist through queue regeneration cycles
- Shopping list updates within 1 second when queue changes (recipe added/removed)
- Recipe marked as cooked removes its ingredients from shopping list immediately
- All items display with correct quantity, unit, and category
- No duplicate items created for same ingredient from multiple recipes
- Zero crashes during shopping list operations in testing
- Performance remains smooth with 50+ shopping list items

## Out of Scope

- Export or sharing functionality (email, text, print)
- Editing quantities or item names in shopping list
- Adding notes to shopping list items
- Toggle to include/exclude specific recipes from shopping list
- Badge count on shopping list tab icon
- Multiple shopping lists (only single active list)
- Price tracking or budget features
- Store location mapping or aisle organization
- Recipe suggestions based on current shopping list items
- Barcode scanning for items
- Integration with grocery delivery services
- Shopping list history or past lists
- Nutritional information on shopping list
- Automatic re-stocking suggestions
- Smart suggestions based on pantry inventory
- Unit preference settings (always show metric/imperial)
- Custom category creation
- Reordering categories manually
- Undo/redo for regeneration
- Shopping list templates
- Shared shopping lists with family members

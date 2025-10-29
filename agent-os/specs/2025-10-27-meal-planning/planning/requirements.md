# Spec Requirements: Meal Planning (Recipe Queue)

## Initial Description
User's original request: "Meal Planning"

Context: This feature has been clarified as a simplified MVP version focused on a chronological recipe queue rather than the calendar-based meal planning system described in the product roadmap (Feature #5). The simplified approach prioritizes quick implementation while still delivering meal planning value.

## Requirements Discussion

### First Round Questions

**Q1: How will users add recipes to their meal plan?**
**Answer:** Add multiple recipes at once from the recipe list view using a multi-select mode

**Q2: What information should be displayed in the meal plan view?**
**Answer:** Simple vertical list showing recipe cards. Users will NOT be able to manually reorder recipes in the queue or indicate which ones they want to make first (chronological order only)

**Q3: Should users be able to adjust servings for recipes in their meal plan?**
**Answer:** Always use the recipe's default servings (no per-queue-item servings adjustment)

**Q4: How should users mark meals as completed or remove them?**
**Answer:** Create a "Mark as Cooked" button to remove it from the queue. Do NOT implement "Recently Cooked" history for now.

**Q5: How should the shopping list feature integrate with meal planning?**
**Answer:** ALL recipes in the queue should be included in the shopping list (no selective checkboxes)

**Q6: Should users be able to clear/manage the entire meal plan?**
**Answer:** Create a remove button for each recipe in the queue

**Q7: How should this integrate with the recipe detail view?**
**Answer:** Create an indicator to tell if the recipe is already in the queue

**Q8: What should we explicitly exclude from this MVP?**
**Answer:** Skip recipe note/modification per queued item. Skip the "Recently Cooked" history.

### Existing Code to Reference
No similar existing features identified for reference.

### Follow-up Questions
No follow-up questions were needed - user provided comprehensive answers.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable - no visual files found.

## Requirements Summary

### Functional Requirements

**Recipe Queue Management:**
- Users can add multiple recipes to a queue from the recipe list view using multi-select mode
- Queue displays recipes in chronological order (FIFO - first added appears first)
- Each queued recipe displays as a recipe card showing essential recipe information (title, image, prep/cook time)
- No manual reordering capability in this MVP
- No date assignments or meal type categorization

**Adding Recipes to Queue:**
- Multi-select mode on recipe list view allowing users to select multiple recipes at once
- Batch add operation to add all selected recipes to queue simultaneously
- Visual feedback showing which recipes are already in the queue (prevent duplicates or show indicator)

**Queue Display:**
- Simple vertical scrollable list of recipe cards
- Chronological order based on when recipes were added to queue
- Display recipe thumbnail, title, and key details on each card
- No grouping by date or meal type

**Servings:**
- Always use recipe's default servings value
- No per-queue-item servings adjustment capability
- Shopping list ingredients calculated using default servings

**Completing/Removing Recipes:**
- "Mark as Cooked" button on each recipe card in queue
- Clicking "Mark as Cooked" immediately removes recipe from queue
- Individual remove button for each recipe (remove without marking as cooked)
- No "Recently Cooked" history tracking in this MVP

**Shopping List Integration:**
- ALL recipes currently in queue are automatically included in shopping list
- No selective inclusion/exclusion checkboxes
- Shopping list aggregates ingredients from all queued recipes
- Removing recipe from queue removes its ingredients from shopping list

**Recipe Detail Integration:**
- Visual indicator on recipe detail view showing if recipe is already in queue
- Ability to add recipe to queue from recipe detail view (single add)
- Indicator should clearly communicate queue membership status

### Reusability Opportunities
No existing similar features identified by user. This is a new feature area for the application.

Potential component reuse opportunities:
- Recipe card component likely exists for recipe list view - can reuse for queue display
- Multi-select patterns may exist elsewhere in the app
- Button components and icons from UI library

### Scope Boundaries

**In Scope:**
- Recipe queue data model (table or adaptation of existing meal_plans table)
- Multi-select mode for recipe list view
- Batch add recipes to queue
- Queue list view showing recipes chronologically
- Recipe cards in queue view
- "Mark as Cooked" button to remove from queue
- Individual remove button for each queued recipe
- Queue membership indicator on recipe detail view
- Add to queue from recipe detail view
- Automatic shopping list generation from all queued recipes
- Ingredient aggregation for shopping list

**Out of Scope:**
- Calendar-based meal planning with date assignments (deferred to future phase)
- Meal type categorization (breakfast/lunch/dinner/snack slots)
- Visual calendar interface
- Drag-and-drop meal assignment
- Manual reordering of queue items
- Per-queue-item servings adjustment
- Recipe notes or modifications specific to queued items
- "Recently Cooked" history tracking
- Meal plan templates or recurring plans
- Weekly/monthly view of planned meals
- Past meal plan history

### Technical Considerations

**Database Schema Decision:**
The existing Local Storage Foundation spec defines a `meal_plans` table with the following structure:
- id: TEXT PRIMARY KEY (UUID)
- recipeId: TEXT NOT NULL (foreign key to recipes.id)
- date: TEXT NOT NULL (ISO 8601 date)
- mealType: TEXT NOT NULL (breakfast, lunch, dinner, snack)
- createdAt: TEXT NOT NULL (ISO 8601 datetime)

**Recommendation:** The existing `meal_plans` table structure is designed for calendar-based meal planning with date and mealType fields that are not needed for a simple chronological queue. Two approaches:

**Option A - Adapt meal_plans table:**
- Use existing `meal_plans` table but ignore/null the `date` and `mealType` fields for queue items
- Order queue items by `createdAt` timestamp for chronological display
- Pros: No schema changes, simpler migration path to full calendar feature later
- Cons: Semantic mismatch (fields present but unused), potential confusion

**Option B - Create dedicated recipe_queue table:**
- Create new simpler table: `recipe_queue` with just id, recipeId, createdAt
- Clearer separation of concerns between simple queue and future calendar-based planning
- Pros: Cleaner schema, no unused fields, clear intent
- Cons: Requires migration, potential data model duplication when calendar feature added

**Recommended Approach:** Option B (dedicated recipe_queue table) for MVP clarity, with plan to migrate to meal_plans table when calendar feature is implemented. This keeps the MVP simple and semantically correct.

**Multi-select Implementation:**
- Recipe list view needs toggle between normal and multi-select mode
- Multi-select mode shows checkboxes on recipe cards
- Selected state management in component state
- Batch operation to add selected recipes to queue
- Clear selection after successful add

**Queue Membership Detection:**
- Service method to check if recipe exists in queue
- Cache queue recipe IDs for performance
- Real-time updates when queue changes

**Shopping List Integration:**
- Query all recipes in queue
- Aggregate ingredients across all queued recipes
- Handle ingredient quantity addition for duplicate ingredients
- Unit normalization for aggregation (e.g., 2 cups + 8 oz)
- Update shopping list automatically when queue changes

**Technology Stack:**
- expo-sqlite for local database operations
- React Context API for queue state management
- FlatList for queue list rendering
- Existing UI components from React Native Reusables
- Zod validation for queue operations
- TypeScript strict mode

**Integration Points:**
- Recipe list view (add multi-select mode)
- Recipe detail view (add queue indicator and add-to-queue action)
- Shopping list feature (read from queue for ingredient aggregation)
- Recipe service (query recipes by IDs)
- Database layer (new queue table and service)

**Performance Considerations:**
- Index on recipeId in queue table for fast lookups
- Limit queue size display with FlatList virtualization
- Debounce shopping list regeneration when queue changes rapidly
- Cache queue membership checks to avoid repeated database queries

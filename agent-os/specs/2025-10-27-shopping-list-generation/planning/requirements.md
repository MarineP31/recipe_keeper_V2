# Spec Requirements: Shopping List Generation

## Initial Description
Shopping List Generation

A feature that automatically generates shopping lists from recipes in the user's queue, helping users purchase ingredients needed for their planned meals.

## Requirements Discussion

### First Round Questions

**Q1:** How should the shopping list be generated?
**Answer:** Automatically generated from ALL recipes currently in the queue. NO toggle option to include/exclude individual recipes. Every recipe in the queue is always included.

**Q2:** How should duplicate ingredients be handled?
**Answer:** Combine duplicate ingredients and sum their quantities. Handle unit conversions for compatible units (e.g., tbsp to cups, oz to lbs).

**Q3:** Should users be able to manually add items to the shopping list?
**Answer:** Yes, support manual additions for non-recipe items (e.g., household items, snacks). Manual items persist even when the recipe queue changes.

**Q4:** How should the shopping list be organized?
**Answer:** Items should be grouped by category (produce, dairy, meat, pantry, etc.) to make shopping easier.

**Q5:** Should items have check-off functionality?
**Answer:** Yes, each item has check-off functionality where users can mark items as purchased during shopping. Checked items remain visible with strikethrough styling.

**Q6:** Can users edit items in the shopping list?
**Answer:** Read-only except for checking items off. Users CANNOT:
- Adjust quantities
- Add notes to items
- Modify the item name

**Q7:** How should list persistence work?
**Answer:** Single active shopping list that regenerates from scratch each time the queue changes. When the queue changes, uncheck all items automatically (reset to unchecked state).

**Q8:** Should the shopping list support export or sharing?
**Answer:** Out of scope for MVP.

**Q9:** How should users access the shopping list?
**Answer:** Shopping list screen available via tab navigation. NO badge count on tab icon.

**Q10:** How should the database handle shopping list persistence?
**Answer:** Use the existing shopping_list_items table. When the queue changes, regenerate the shopping list and reset all items to unchecked state.

**Q11:** What happens when a recipe is marked as cooked in the queue?
**Answer:** When a recipe is marked as cooked in the queue, remove all its ingredients from the shopping list immediately.

**Q12:** What visual design approach should be used?
**Answer:** Use standard mobile shopping list patterns (clean, scannable list with checkboxes, category headers, strikethrough for checked items).

### Existing Code to Reference
No similar existing features were explicitly identified for reference. However, the feature builds upon existing recipe queue functionality and ingredient data structures.

### Follow-up Questions
No follow-up questions were needed after initial clarification round.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Standard mobile shopping list patterns should be followed:
- Clean, scannable list layout
- Clear category headers
- Checkbox UI for check-off functionality
- Strikethrough styling for checked items
- Readable ingredient names and quantities
- Easy-to-tap interaction areas

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Automatically generate shopping list from ALL recipes in the queue (no opt-out)
- Aggregate duplicate ingredients with quantity summation
- Perform unit conversions for compatible units
- Support manual item additions (persist independently from recipes)
- Group items by category (produce, dairy, meat, pantry, etc.)
- Provide check-off functionality for marking items as purchased
- Display checked items with strikethrough (remain visible)
- Accessible via tab navigation (no badge count)

**List Regeneration:**
- Regenerate from scratch when queue changes (add/remove recipes)
- Reset all items to unchecked state on regeneration
- Preserve manually added items through regeneration
- Remove ingredients immediately when recipe is marked as cooked

**User Actions Enabled:**
- View categorized shopping list
- Check off items as purchased
- Add manual items (non-recipe items)
- Navigate to shopping list via tab

**Data Management:**
- Aggregate ingredients from all queued recipes
- Normalize ingredient names for proper aggregation
- Convert compatible units for summation
- Store checked/unchecked state
- Persist manual items separately from recipe-generated items
- Real-time sync with queue changes

### Reusability Opportunities
- Existing recipe queue data structure
- Ingredient data models from recipes
- Category/tag system if already implemented
- Tab navigation patterns
- Database persistence patterns (shopping_list_items table exists)

### Scope Boundaries

**In Scope:**
- Auto-generation from all queued recipes
- Ingredient aggregation with unit conversion
- Category-based grouping
- Check-off functionality with strikethrough
- Manual item additions with persistence
- Single active shopping list
- Tab navigation access
- Regeneration on queue changes
- Immediate removal when recipe marked as cooked
- Unchecking all items on regeneration

**Out of Scope:**
- Export/sharing functionality
- Editing item quantities
- Adding notes to items
- Modifying item names
- Toggle to include/exclude specific recipes
- Badge count on tab icon
- Multiple shopping lists
- Price tracking
- Store location mapping
- Recipe suggestions based on current items

### Technical Considerations

**Unit Conversion Logic:**
- Handle common cooking unit conversions:
  - Volume: tsp ↔ tbsp ↔ cups ↔ fl oz ↔ liters
  - Weight: oz ↔ lbs ↔ grams ↔ kg
  - Count: individual items (eggs, onions, etc.)
- Preserve original unit if no conversion needed
- Display most appropriate unit after conversion (e.g., 16 tbsp → 1 cup)

**Category Inference:**
- Implement category assignment for ingredients:
  - Produce (vegetables, fruits)
  - Dairy (milk, cheese, yogurt)
  - Meat & Seafood
  - Pantry (dry goods, spices, oils)
  - Frozen
  - Bakery
  - Other (catch-all)
- May use keyword matching or predefined category mapping

**Ingredient Name Normalization:**
- Case-insensitive matching ("Eggs" = "eggs" = "egg")
- Plural/singular handling ("tomato" = "tomatoes")
- Trim whitespace and special characters
- Consider ingredient variations (e.g., "olive oil" vs "extra virgin olive oil")

**Manual Items Persistence:**
- Store manual items with special flag/type
- Exclude from regeneration deletion
- Keep manual items checked/unchecked state independent
- Allow manual item deletion

**Database Schema Approach:**
- Use existing shopping_list_items table
- Track item source (recipe_id vs manual)
- Store checked/unchecked state
- Store category assignment
- Track aggregated quantity and unit
- Link to original ingredient data for recipe-generated items

**Real-time Sync:**
- Listen for queue changes (add/remove recipe)
- Listen for recipe status changes (marked as cooked)
- Trigger regeneration automatically
- Update UI immediately after regeneration

**Implementation Notes:**
- Regeneration should be atomic (clear and rebuild)
- Manual items must be preserved during regeneration
- Checked state reset only affects recipe-generated items on regeneration
- Category grouping should maintain consistent order
- Consider performance for large recipe queues (optimize aggregation)
- Handle edge cases: empty queue, no ingredients, all manual items

# Specification: Local Storage Foundation

## Goal
Implement local SQLite database persistence for recipes, meal plans, and shopping lists with automatic migrations, type-safe operations, and seed data to enable all subsequent MVP features in an offline-first, privacy-focused architecture.

## User Stories
- As a user, I want my recipes stored locally so that I have complete privacy and can access them offline
- As a user, I want sample recipes pre-loaded so that I can explore the app immediately without entering data
- As a user, I want my meal plans and shopping lists persisted so that I don't lose my planning work
- As a developer, I want type-safe database operations so that I catch errors at compile time
- As a developer, I want automatic schema migrations so that database updates are seamless across app versions

## Core Requirements

### Database Schema
- SQLite database with three core tables: recipes, meal_plans, shopping_list_items
- Recipes table stores complete recipe data with JSON columns for arrays (ingredients, steps, tags)
- Meal plans table supports multiple recipes per meal slot (breakfast, lunch, dinner, snack)
- Shopping list items support both auto-generated (from meal plans) and manual entries
- All tables include timestamp fields (createdAt, updatedAt)
- Soft deletes for recipes (deletedAt field), hard deletes for meal plans and shopping items

### Data Types & Validation
- TypeScript interfaces for Recipe, MealPlan, and ShoppingListItem entities
- Zod schemas for runtime validation of all database operations
- Support for enums: DishCategory (breakfast, lunch, dinner, snack, dessert, appetizer) and MeasurementUnit (cup, tbsp, tsp, oz, lb, g, kg, ml, l, unit)
- Validation constraints: servings 1-50, positive times, required fields (title, ingredients, steps)

### Database Operations
- CRUD operations for all three entities with type-safe methods
- Query methods: get by ID, list all (with pagination support), search by criteria
- Batch operations for meal plan assignments and shopping list aggregation
- Transaction support for multi-step operations (e.g., generating shopping list from meal plan)

### Migration System
- Automatic migration execution on app startup
- Sequential numbered migration files (001_initial_schema.ts, 002_add_indexes.ts, etc.)
- Track applied migrations using SQLite user_version pragma
- Error handling with rollback capability for failed migrations

### Seed Data
- 5-10 sample recipes covering various categories and meal types
- Seed data defined in TypeScript for type safety
- Automatic population on first app launch (check if recipes table is empty)
- Include representative data: breakfast, lunch, dinner recipes with varied complexity

## Visual Design
No visual components in this spec - this is a data layer implementation.

## Reusable Components

### Existing Code to Leverage
- **Project Structure**: Follow existing patterns from `/constants/theme.ts` for exports
- **TypeScript Config**: Use strict mode already configured in `tsconfig.json`
- **Coding Standards**: Apply naming conventions from `/agent-os/standards/global/coding-style.md`
- **Migration Patterns**: Follow principles from `/agent-os/standards/backend/migrations.md`
- **Validation Patterns**: Apply best practices from `/agent-os/standards/global/validation.md`

### New Components Required
- **Database Connection Module**: No expo-sqlite usage exists yet - need to create connection manager
- **Migration Runner**: New utility to track and execute migrations sequentially
- **Type Definitions**: Define Recipe, Ingredient, MealPlan, ShoppingListItem interfaces
- **Zod Schemas**: Runtime validation schemas matching TypeScript types
- **CRUD Services**: Type-safe database operation wrappers for each entity
- **Seed Data Module**: Sample recipe data and seeding logic

## Technical Approach

### File Structure
```
lib/
├── db/
│   ├── index.ts                    # Re-export all database modules
│   ├── connection.ts               # SQLite connection management
│   ├── migrations/
│   │   ├── index.ts                # Migration runner
│   │   ├── 001_initial_schema.ts   # Create tables
│   │   └── 002_add_indexes.ts      # Performance indexes
│   ├── schema/
│   │   ├── recipe.ts               # Recipe types & Zod schema
│   │   ├── meal-plan.ts            # MealPlan types & Zod schema
│   │   └── shopping-list.ts        # ShoppingListItem types & Zod schema
│   ├── services/
│   │   ├── recipe-service.ts       # Recipe CRUD operations
│   │   ├── meal-plan-service.ts    # MealPlan CRUD operations
│   │   └── shopping-list-service.ts # ShoppingList CRUD operations
│   └── seed/
│       ├── index.ts                # Seed data orchestration
│       └── recipes.ts              # Sample recipe data
constants/
└── enums.ts                        # DishCategory, MeasurementUnit enums
```

### Database Schema Details

**recipes table:**
- id: TEXT PRIMARY KEY (UUID)
- title: TEXT NOT NULL
- servings: INTEGER NOT NULL (1-50)
- category: TEXT NOT NULL (DishCategory enum)
- ingredients: TEXT NOT NULL (JSON array of Ingredient objects)
- steps: TEXT NOT NULL (JSON array of strings)
- imageUri: TEXT NULL (local file path)
- prepTime: INTEGER NULL (minutes)
- cookTime: INTEGER NULL (minutes)
- tags: TEXT NULL (JSON array of strings)
- createdAt: TEXT NOT NULL (ISO 8601 datetime)
- updatedAt: TEXT NOT NULL (ISO 8601 datetime)
- deletedAt: TEXT NULL (ISO 8601 datetime, soft delete)

**meal_plans table:**
- id: TEXT PRIMARY KEY (UUID)
- recipeId: TEXT NOT NULL (foreign key to recipes.id)
- date: TEXT NOT NULL (ISO 8601 date)
- mealType: TEXT NOT NULL (breakfast, lunch, dinner, snack)
- createdAt: TEXT NOT NULL (ISO 8601 datetime)
- INDEX: (date, mealType) for calendar queries
- INDEX: (recipeId) for recipe lookups

**shopping_list_items table:**
- id: TEXT PRIMARY KEY (UUID)
- name: TEXT NOT NULL (ingredient name)
- quantity: REAL NULL (numeric amount)
- unit: TEXT NULL (MeasurementUnit enum)
- checked: INTEGER NOT NULL DEFAULT 0 (boolean as 0/1)
- recipeId: TEXT NULL (foreign key to recipes.id, null for manual items)
- mealPlanId: TEXT NULL (foreign key to meal_plans.id)
- createdAt: TEXT NOT NULL (ISO 8601 datetime)
- INDEX: (checked) for filtering
- INDEX: (recipeId) for recipe-based queries

### TypeScript Type Structure
```typescript
// Ingredient interface
interface Ingredient {
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
}

// Recipe interface
interface Recipe {
  id: string;
  title: string;
  servings: number;
  category: DishCategory;
  ingredients: Ingredient[];
  steps: string[];
  imageUri: string | null;
  prepTime: number | null;
  cookTime: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// MealPlan interface
interface MealPlan {
  id: string;
  recipeId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: string;
}

// ShoppingListItem interface
interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  checked: boolean;
  recipeId: string | null;
  mealPlanId: string | null;
  createdAt: string;
}
```

### Migration Strategy
- Use SQLite PRAGMA user_version to track current schema version
- Migration files numbered sequentially starting from 001
- Each migration exports up() and down() functions for reversibility
- Migration runner compares user_version to latest migration number
- Execute pending migrations in transaction with automatic rollback on error
- Log migration execution for debugging

### Database Initialization Flow
1. App startup triggers database initialization
2. Check if database file exists, create if needed
3. Run migration runner to apply pending migrations
4. Check if recipes table is empty
5. If empty, execute seed data insertion
6. Return database connection for use by services

### Error Handling
- Define DatabaseError class extending Error with specific error codes
- Validation errors thrown before database operations (Zod validation)
- Connection errors handled with retry logic (max 3 attempts)
- Migration errors logged with full stack trace and rolled back
- Service-level errors include context (operation, entity, id)

## Seed Data Approach
- 8 sample recipes covering variety of meal types and complexity levels
- Include: 2 breakfast, 2 lunch, 3 dinner, 1 dessert
- Recipes feature common ingredients to demonstrate shopping list aggregation
- Range of prep/cook times: quick (15-30 min) to moderate (45-60 min)
- Mix of categories: American, Italian, Mexican cuisine
- Sample tags: "quick", "vegetarian", "family-friendly", "one-pot"
- Seed recipes inserted only if recipes table count is 0 (first launch)

## Testing Considerations
- Unit tests for Zod schema validation (valid/invalid inputs)
- Integration tests for CRUD operations on each entity
- Migration tests: verify schema creation, index creation, version tracking
- Seed data tests: verify sample recipes inserted correctly
- Transaction tests: verify rollback on error scenarios
- Performance tests: query speed with indexes, bulk operations timing
- Test database isolation: use in-memory SQLite for test runs

## Success Criteria
- Database initializes successfully on first app launch within 2 seconds
- All CRUD operations complete in <100ms for single records
- Recipe list queries return in <200ms for 100+ recipes
- Migrations execute successfully with zero data loss
- Seed data populates 8 sample recipes on clean install
- Type errors caught at compile time for all database operations
- Zero crashes related to database operations during MVP testing
- Database file size remains under 10MB with 200 recipes

## Out of Scope
- Cloud sync or backup functionality (Phase 2, feature #13)
- Authentication or user management (Phase 2, feature #14)
- Image storage optimization (Phase 2, feature #11)
- Recipe import from URLs (Phase 2, feature #10)
- Nutrition API integration (Phase 3, feature #16)
- Full-text search implementation (Phase 2, feature #9)
- Export/sharing functionality (Phase 2, feature #15)
- UI components or screens (covered in separate feature specs #2-8)
- OCR integration (Feature #4)
- Actual meal plan calendar logic (Feature #5)
- Shopping list aggregation algorithms (Feature #6)
- Database encryption (future security enhancement)
- Multi-user support on same device (not in roadmap)

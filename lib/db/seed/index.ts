import { recipeService } from '../services/recipe-service';
import { sampleRecipes } from './recipes';
import { DatabaseError } from '../connection';

/**
 * Seed database with sample data
 * Only seeds if the database is empty (no recipes exist)
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Checking if database needs seeding...');

    // Check if recipes table is empty
    const recipeCount = await recipeService.getRecipeCount();

    if (recipeCount > 0) {
      console.log(
        `Database already has ${recipeCount} recipes. Skipping seed.`
      );
      return;
    }

    console.log('Database is empty. Starting seed process...');

    // Insert sample recipes
    let successCount = 0;
    let errorCount = 0;

    for (const recipeData of sampleRecipes) {
      try {
        await recipeService.createRecipe(recipeData);
        successCount++;
        console.log(
          `✓ Seeded recipe: ${recipeData.title} (${successCount}/${sampleRecipes.length})`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to seed recipe: ${recipeData.title}`,
          error
        );
      }
    }

    // Log summary
    console.log('\n=== Seed Summary ===');
    console.log(`Total recipes: ${sampleRecipes.length}`);
    console.log(`Successfully seeded: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    if (errorCount > 0) {
      throw new DatabaseError(
        'SEED_PARTIAL_FAILURE',
        `Seeding completed with ${errorCount} errors`
      );
    }

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);

    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'SEED_FAILED',
      'Failed to seed database',
      error
    );
  }
}

/**
 * Check if database needs seeding
 */
export async function needsSeeding(): Promise<boolean> {
  try {
    const recipeCount = await recipeService.getRecipeCount();
    return recipeCount === 0;
  } catch (error) {
    console.error('Failed to check if database needs seeding:', error);
    return false;
  }
}

/**
 * Clear all data from database (useful for testing)
 * WARNING: This will delete all data!
 */
export async function clearDatabase(): Promise<void> {
  try {
    console.log('WARNING: Clearing all database data...');

    const recipes = await recipeService.getAllRecipes({
      includeDeleted: true,
    });

    for (const recipe of recipes) {
      await recipeService.deleteRecipe(recipe.id);
    }

    console.log('✓ Database cleared successfully');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw new DatabaseError(
      'CLEAR_FAILED',
      'Failed to clear database',
      error
    );
  }
}

/**
 * Reset database (clear and re-seed)
 * WARNING: This will delete all data and re-seed!
 */
export async function resetDatabase(): Promise<void> {
  try {
    console.log('Resetting database...');
    await clearDatabase();
    await seedDatabase();
    console.log('✓ Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw new DatabaseError(
      'RESET_FAILED',
      'Failed to reset database',
      error
    );
  }
}

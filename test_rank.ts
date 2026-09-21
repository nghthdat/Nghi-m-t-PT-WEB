
import { INITIAL_RECIPES } from './src/data/seedRecipes';

function rankRecipesLocal(userIngredients: string[]) {
  const normalizedUser = userIngredients.map(i => i.toLowerCase().trim()).filter(Boolean);
  const results = [];

  for (const recipe of INITIAL_RECIPES) {
    const matched = [];
    const missing = [];

    for (const rIng of recipe.ingredients) {
      const rName = rIng.name.toLowerCase();
      const isMatched = normalizedUser.some(uIng => rName.includes(uIng) || uIng.includes(rName));

      if (isMatched) {
        matched.push(rIng.name);
      } else {
        missing.push(rIng.name);
      }
    }

    if (matched.length > 0) {
      results.push(recipe.title);
    }
  }
  return results;
}

console.log(rankRecipesLocal(['th?t ba ch?']));


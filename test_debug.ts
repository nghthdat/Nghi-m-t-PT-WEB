
import { INITIAL_RECIPES } from './src/data/seedRecipes';

const userIngredients = ['th?t ba ch?'];
const normalizedUser = userIngredients.map(i => i.toLowerCase().trim()).filter(Boolean);
console.log('Normalized user:', normalizedUser);

for (const recipe of INITIAL_RECIPES) {
  if (recipe.id === 'thit-kho-to') {
    const matched = [];
    const missing = [];
    for (const rIng of recipe.ingredients) {
      const rName = rIng.name.toLowerCase();
      const isMatched = normalizedUser.some(uIng => {
        const rIncludes = rName.includes(uIng);
        const uIncludes = uIng.includes(rName);
        console.log('Checking uIng=', uIng, 'rName=', rName, 'rIncludes=', rIncludes, 'uIncludes=', uIncludes);
        return rIncludes || uIncludes;
      });
      if (isMatched) matched.push(rIng.name);
      else missing.push(rIng.name);
    }
    console.log('Matched:', matched);
    if (matched.length > 0) {
       console.log('Would push recipe!');
    }
  }
}


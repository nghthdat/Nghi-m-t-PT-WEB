const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Modify the parsing logic in suggest-recipes to match by ID, Title, or Name
const oldParsing = `        const recipeId = item.recipe_id || item.recipeId;
        const matchPct = item.match_percent ?? item.matchPercentage ?? 0;
        const missing = item.missing_ingredients || item.missingIngredients || [];
        const recipe = recipesStore.find(r => r.id === recipeId);`;

const newParsing = `        const recipeId = item.recipe_id || item.recipeId || '';
        const recipeName = item.recipe_name || item.name || '';
        const matchPct = item.match_percent ?? item.matchPercentage ?? 0;
        const missing = item.missing_ingredients || item.missingIngredients || [];
        
        // Match by ID or Name to prevent AI hallucination
        const recipe = recipesStore.find(r => 
          r.id === recipeId || 
          r.title.toLowerCase() === recipeId.toLowerCase() || 
          (recipeName && r.title.toLowerCase() === recipeName.toLowerCase())
        );`;

content = content.replace(oldParsing, newParsing);

// And update the prompt to explicitly ask for both id and name just in case
const oldPrompt = `    { "recipe_id": "...", "match_percent": 85, "missing_ingredients": ["..."] }`;
const newPrompt = `    { "recipe_id": "...", "recipe_name": "...", "match_percent": 85, "missing_ingredients": ["..."] }`;
content = content.replace(oldPrompt, newPrompt);

fs.writeFileSync('server.ts', content);

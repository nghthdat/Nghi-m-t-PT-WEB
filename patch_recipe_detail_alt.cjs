const fs = require('fs');
let content = fs.readFileSync('src/components/RecipeDetailScreen.tsx', 'utf8');

content = content.replace(
  'alt={`Bước ${idx + 1}`}', 
  'alt={`Bước ${idx + 1}: ${st.description ? st.description.substring(0, 50) : \'Thực hiện\'}`}'
);

content = content.replace(
  'alt={`Bước ${currentCookStep + 1}`}',
  'alt={`Bước ${currentCookStep + 1}: ${recipe.steps[currentCookStep].description ? recipe.steps[currentCookStep].description.substring(0, 50) : \'Thực hiện\'}`}'
);

fs.writeFileSync('src/components/RecipeDetailScreen.tsx', content);

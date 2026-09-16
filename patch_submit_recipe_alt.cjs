const fs = require('fs');
let content = fs.readFileSync('src/components/SubmitRecipeScreen.tsx', 'utf8');

content = content.replace('alt="Ảnh món ăn"', 'alt={title ? `Hình ảnh món ${title}` : "Ảnh món ăn"}');

fs.writeFileSync('src/components/SubmitRecipeScreen.tsx', content);

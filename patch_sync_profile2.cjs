const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  "if (recipe.author_uid === uid) {",
  "if (recipe.author_uid === uid || (recipe.author && recipe.author.uid === uid)) {"
);

fs.writeFileSync('server.ts', content);

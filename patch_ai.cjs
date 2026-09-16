const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Rewrite the prompt
const oldPrompt = `      const prompt = \`Bạn là trợ lý gợi ý món ăn. Bạn sẽ nhận vào:
- Danh sách nguyên liệu người dùng đang có: \${JSON.stringify(ingList)}
- Danh sách công thức hiện có trong hệ thống:
\${JSON.stringify(recipeCatalog, null, 2)}

Nhiệm vụ: CHỈ chọn và xếp hạng lại các công thức có sẵn trong danh sách được cung cấp theo % nguyên liệu khớp với nguyên liệu người dùng có. KHÔNG được tự bịa ra công thức mới không có trong danh sách.

Trả về CHỈ JSON theo format sau, không thêm text nào khác:
{
  "suggestions": [
    { "recipe_id": "...", "match_percent": 85, "missing_ingredients": ["..."] }
  ]
}\`;`;

const newPrompt = `      const prompt = \`Bạn là hệ thống gợi ý món ăn cực kỳ khắt khe. Bạn nhận vào:
- Danh sách nguyên liệu/từ khóa người dùng đang có: \${JSON.stringify(ingList)}
- Danh sách công thức trong hệ thống:
\${JSON.stringify(recipeCatalog, null, 2)}

Nhiệm vụ:
1. TUYỆT ĐỐI CHỈ TRẢ VỀ các công thức có chứa TRỰC TIẾP nguyên liệu/từ khóa mà người dùng đã nhập.
2. KHÔNG SUY DIỄN: Nếu người dùng nhập "thịt", chỉ khớp với công thức có chứa nguyên liệu có từ "thịt". Đừng tự động trả về "phở bò", "gà" trừ khi trong công thức đó có nguyên liệu tên "thịt".
3. Nếu người dùng nhập nhiều nguyên liệu, hãy ưu tiên công thức đáp ứng được nhiều nguyên liệu nhất.
4. KHÔNG BỊA RA công thức mới.
5. Nếu không có công thức nào khớp hợp lý với TỪ KHÓA, hãy trả về mảng suggestions rỗng [].

Trả về CHỈ JSON theo format sau (KHÔNG thêm markdown text):
{
  "suggestions": [
    { "recipe_id": "...", "match_percent": 85, "missing_ingredients": ["..."] }
  ]
}\`;`;

content = content.replace(oldPrompt, newPrompt);

// 2. Rewrite rankRecipesLocal
const oldRankRecipesLocalRegex = /function rankRecipesLocal\(userIngredients: string\[\]\): SuggestedRecipeMatch\[\] \{[\s\S]*?return results;\n\}/;

const newRankRecipesLocal = `function rankRecipesLocal(userIngredients: string[]): SuggestedRecipeMatch[] {
  const normalizedUser = userIngredients.map(i => i.toLowerCase().trim()).filter(Boolean);
  if (normalizedUser.length === 0) {
    return recipesStore.map(r => ({
      recipe: r,
      matchPercentage: 100,
      matchedIngredients: r.ingredients.map(ing => ing.name),
      missingIngredients: [],
      reason: 'Món ăn gợi ý phổ biến cho bạn.'
    }));
  }

  const results: SuggestedRecipeMatch[] = [];

  for (const recipe of recipesStore) {
    const matched: string[] = [];
    const missing: string[] = [];

    for (const rIng of recipe.ingredients) {
      const rName = rIng.name.toLowerCase();
      // Strict matching without weird hallucinated rules
      const isMatched = normalizedUser.some(uIng => rName.includes(uIng) || uIng.includes(rName));

      if (isMatched) {
        matched.push(rIng.name);
      } else {
        missing.push(rIng.name);
      }
    }

    if (matched.length > 0) {
      const matchRatio = recipe.ingredients.length > 0 ? (matched.length / recipe.ingredients.length) : 0;
      let matchPct = Math.round(matchRatio * 100);

      // Boost percentage if primary ingredient matches
      if (matchPct < 50) {
        matchPct = Math.min(85, Math.round(matchRatio * 100 + 40));
      }
      if (matched.length >= 2 && matchPct < 80) {
        matchPct = Math.min(95, matchPct + 30);
      }
      if (missing.length === 0) {
        matchPct = 100;
      }

      results.push({
        recipe,
        matchPercentage: Math.max(25, Math.min(100, matchPct)),
        matchedIngredients: matched,
        missingIngredients: missing,
        reason: missing.length === 0 
          ? 'Bạn có đủ 100% nguyên liệu cho món này!' 
          : \`Khớp \${matched.length} nguyên liệu chính (\${matched.join(', ')}). Chỉ cần chuẩn bị thêm \${missing.slice(0, 2).join(', ')}.\`
      });
    }
  }

  // Sort descending by match percentage
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return results;
}`;

content = content.replace(oldRankRecipesLocalRegex, newRankRecipesLocal);

fs.writeFileSync('server.ts', content);

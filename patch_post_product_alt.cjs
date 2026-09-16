const fs = require('fs');
let content = fs.readFileSync('src/components/PostAffiliateProductModal.tsx', 'utf8');

content = content.replace(
  'alt={`Ảnh ${idx + 1}`}',
  'alt={`Ảnh ${idx + 1} của sản phẩm ${name || ""}`.trim()}'
);

fs.writeFileSync('src/components/PostAffiliateProductModal.tsx', content);

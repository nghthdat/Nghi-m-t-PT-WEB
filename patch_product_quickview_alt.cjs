const fs = require('fs');
let content = fs.readFileSync('src/components/ProductQuickViewModal.tsx', 'utf8');

content = content.replace(
  'alt={`Ảnh ${idx + 1}`}',
  'alt={`Ảnh ${idx + 1} của ${product.name}`}'
);

fs.writeFileSync('src/components/ProductQuickViewModal.tsx', content);

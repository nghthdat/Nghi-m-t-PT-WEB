const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

content = content.replace(
  'alt="Avatar"',
  'alt="Tùy chọn ảnh đại diện"'
);

fs.writeFileSync('src/components/ProfileScreen.tsx', content);

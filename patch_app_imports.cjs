const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetImport = "import { AuthProvider, useAuth } from './context/AuthContext';";
const additionalImports = `import { Footer } from './components/Footer';
import { StaticPageScreen } from './components/StaticPageScreen';\n`;

if (!content.includes("import { Footer }")) {
  content = content.replace(targetImport, additionalImports + targetImport);
  fs.writeFileSync('src/App.tsx', content);
}

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  useEffect(() => {
    fetchRecipes();
    fetchPendingCount();
  }, []);`;

const replacement = `  useEffect(() => {
    fetchRecipes();
    fetchPendingCount();
    
    const handleProfileUpdate = () => {
      fetchRecipes();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);

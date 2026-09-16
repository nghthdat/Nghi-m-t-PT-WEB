const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const routeCode = `
  // Sync profile update from client to in-memory recipe stores
  app.post('/api/users/sync-profile', (req, res) => {
    const { uid, name, avatar } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Missing uid' });
    }

    let updatedCount = 0;

    const updateAuthor = (recipe) => {
      let changed = false;
      if (recipe.author_uid === uid) {
        if (name && recipe.author_name !== name) {
          recipe.author_name = name;
          if (recipe.author) recipe.author.name = name;
          changed = true;
        }
        if (avatar !== undefined && recipe.author_avatar !== avatar) {
          recipe.author_avatar = avatar;
          if (recipe.author) recipe.author.avatar = avatar;
          changed = true;
        }
      }
      return changed;
    };

    recipesStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    pendingStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    archivedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    rejectedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });

    res.json({ success: true, updatedCount });
  });
`;

content = content.replace("  // User Auth Fallback Endpoints (Email + Password when Firebase Auth provider is restricted)", routeCode + "\n  // User Auth Fallback Endpoints (Email + Password when Firebase Auth provider is restricted)");

fs.writeFileSync('server.ts', content);

const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    rejectedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });`;
const newCode = `    rejectedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });

    // Also update reviewsStore
    for (const recipeId in reviewsStore) {
      reviewsStore[recipeId].forEach(review => {
        if (review.author_uid === uid) {
          if (name && review.author_name !== name) {
            review.author_name = name;
            updatedCount++;
          }
          if (avatar !== undefined && review.author_avatar !== avatar) {
            review.author_avatar = avatar;
            updatedCount++;
          }
        }
      });
    }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('server.ts', content);

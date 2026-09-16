const http = require('http');

async function run() {
  const suggestRes = await fetch('http://localhost:3000/api/recipes');
  let suggestData = await suggestRes.json();
  console.log("Recipes count:", suggestData.data.length);
  
  // Find a recipe to change its author name.
  // Actually we can just sync the author name for 'test_uid' which we created earlier.
  const syncRes = await fetch('http://localhost:3000/api/users/sync-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: "test_uid", name: "Châu Mới", avatar: "new_avatar_url" })
  });
  console.log("Sync response:", await syncRes.json());
  
  const suggestRes2 = await fetch('http://localhost:3000/api/recipes');
  let suggestData2 = await suggestRes2.json();
  
  const testRecipe = suggestData2.data.find(r => r.author_uid === 'test_uid');
  if (testRecipe) {
    console.log("Updated test recipe author name:", testRecipe.author_name);
    console.log("Updated test recipe author.name:", testRecipe.author.name);
    console.log("Updated test recipe avatar:", testRecipe.author_avatar);
  } else {
    console.log("Test recipe not found");
  }
}

run();

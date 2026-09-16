const http = require('http');

async function run() {
  const payload = {
    title: "Món mới test " + Date.now(),
    description: "Ngon",
    image: "",
    ingredients: [{name: "trứng", amount: "2 quả"}, {name: "thịt bằm", amount: "100g"}],
    steps: [{description: "Chiên"}],
    categories: ["Món chính"],
    servings: "2",
    prepTime: "10m",
    authorName: "Old Name",
    authorUid: "test_uid",
    authorAvatar: "old_avatar"
  };

  const submitRes = await fetch('http://localhost:3000/api/submit-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log("Submit:", (await submitRes.json()).status);

  // Sync profile
  const syncRes = await fetch('http://localhost:3000/api/users/sync-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: "test_uid", name: "New Name", avatar: "new_avatar" })
  });
  console.log("Sync response:", await syncRes.json());
  
  const recipesRes = await fetch('http://localhost:3000/api/recipes');
  let data = await recipesRes.json();
  const testRecipe = data.data.find(r => r.author_uid === 'test_uid' || (r.author && r.author.uid === 'test_uid'));
  if (testRecipe) {
    console.log("Author name:", testRecipe.author_name);
    console.log("Author.name:", testRecipe.author.name);
  }
}
run();

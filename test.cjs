const http = require('http');

async function run() {
  // Wait a bit for server to start if not running
  const payload = {
    title: "Trứng chiên thịt bằm",
    description: "Trứng chiên ngon",
    image: "",
    ingredients: [{name: "trứng", amount: "2 quả"}, {name: "thịt bằm", amount: "100g"}],
    steps: [{description: "Chiên lên"}],
    categories: ["Món chính"],
    servings: "2",
    prepTime: "10m",
    authorName: "Test",
    authorUid: "test_uid",
    authorAvatar: ""
  };

  const submitRes = await fetch('http://localhost:3000/api/submit-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log("Submit:", await submitRes.json());

  const suggestRes = await fetch('http://localhost:3000/api/suggest-recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: ["thịt bằm", "trứng"] })
  });
  console.log("Suggest:", JSON.stringify(await suggestRes.json(), null, 2));
}

run();

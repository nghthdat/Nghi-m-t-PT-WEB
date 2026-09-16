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
    authorName: "Test",
    authorUid: "test_uid",
    authorAvatar: ""
  };

  const submitRes = await fetch('http://localhost:3000/api/submit-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const submitData = await submitRes.json();
  console.log("Submit result:", submitData.status || submitData.error);
  
  const suggestRes = await fetch('http://localhost:3000/api/suggest-recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: ["thịt bằm"] })
  });
  const suggestData = await suggestRes.json();
  const titles = suggestData.data.map(d => d.recipe.title);
  console.log("Suggested titles:", titles);
  console.log("Source:", suggestData.source);
}

run();

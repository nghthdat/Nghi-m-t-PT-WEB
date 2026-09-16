const { GoogleGenAI } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const ingList = ["thịt bằm", "trứng"];
  const recipeCatalog = [
    {
      "id": "recipe-admin-1789484708195",
      "name": "Trứng chiên thịt bằm",
      "ingredients": [
        "trứng",
        "thịt bằm"
      ],
      "calories": 200,
      "tags": [
        "Món chính"
      ]
    },
    {
      "id": "thit-kho-to",
      "name": "Thịt kho tộ",
      "ingredients": [
        "Thịt ba chỉ heo",
        "Trứng cút"
      ],
      "calories": 450,
      "tags": [
        "man"
      ]
    }
  ];

  const prompt = `Bạn là hệ thống gợi ý món ăn cực kỳ khắt khe. Bạn nhận vào:
- Danh sách nguyên liệu/từ khóa người dùng đang có: ${JSON.stringify(ingList)}
- Danh sách công thức trong hệ thống:
${JSON.stringify(recipeCatalog, null, 2)}

Nhiệm vụ:
1. TUYỆT ĐỐI CHỈ TRẢ VỀ các công thức có chứa TRỰC TIẾP nguyên liệu/từ khóa mà người dùng đã nhập.
2. KHÔNG SUY DIỄN.
3. Nếu người dùng nhập nhiều nguyên liệu, hãy ưu tiên công thức đáp ứng được nhiều nguyên liệu nhất.
4. KHÔNG BỊA RA công thức mới.
5. Nếu không có công thức nào khớp hợp lý với TỪ KHÓA, hãy trả về mảng suggestions rỗng [].

Trả về CHỈ JSON theo format sau (KHÔNG thêm markdown text):
{
  "suggestions": [
    { "recipe_id": "...", "match_percent": 85, "missing_ingredients": ["..."] }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  });

  console.log(response.text);
}

run().catch(console.error);

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question;

    if (!question) {
      return res.status(400).json({ answer: "No question provided." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful math and study assistant. Always answer clearly. Solve math step by step."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    console.log("FULL DATA:", JSON.stringify(data)); // 🔍 debug

    let answer = "No response from AI.";

    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message?.content || answer;
    } else if (data.error) {
      answer = "API Error: " + data.error.message;
    } else {
      answer = JSON.stringify(data); // fallback
    }

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "Server error: " + err.message
    });
  }
}

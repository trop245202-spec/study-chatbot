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
        model: "openchat/openchat-7b",
        messages: [
          {
            role: "system",
            content: "You are a helpful academic assistant. Answer in English and solve math step by step."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "Server error: " + err.message
    });
  }
}

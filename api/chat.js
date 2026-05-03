import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question;
    const type = body?.type;

    if (!question) {
      return res.status(400).json({ answer: "Ask something first." });
    }

    // 📄 READ KNOWLEDGE
    const knowledge = fs.readFileSync(process.cwd() + "/data/knowledge.txt", "utf-8");

    // 🔍 QUERY MODE (file search)
    if (type === "query") {
      let lowerQ = question.toLowerCase();

      let sentences = knowledge.split(".");
      let found = sentences.find(s => s.toLowerCase().includes(lowerQ));

      if (found) {
        return res.status(200).json({ answer: found.trim() });
      } else {
        return res.status(200).json({ answer: "Not found in knowledge." });
      }
    }

    // 🤖 QUESTION MODE (AI)
    if (type === "question") {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openchat/openchat-3.5",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Solve math step-by-step and answer clearly in English."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });

      const data = await response.json();

      let answer = data?.choices?.[0]?.message?.content;

      if (!answer) {
        answer = "AI not responding. Try again.";
      }

      return res.status(200).json({ answer });
    }

  } catch (err) {
    return res.status(500).json({
      answer: "Server error: " + err.message
    });
  }
}

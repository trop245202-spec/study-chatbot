import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question?.toLowerCase();

    if (!question) {
      return res.status(400).json({ answer: "Please ask a question." });
    }

    // 📄 Read knowledge
    const knowledge = fs.readFileSync("./data/knowledge.txt", "utf-8");

    // 🔍 simple keyword search
    let answerFromFile = "";

    if (question.includes("fee")) {
      answerFromFile = knowledge.match(/fees?.*?\./i)?.[0] || "";
    } else if (question.includes("time")) {
      answerFromFile = knowledge.match(/time.*?\./i)?.[0] || "";
    } else if (question.includes("course")) {
      answerFromFile = knowledge.match(/courses?.*?\./i)?.[0] || "";
    }

    // ✅ if found in file
    if (answerFromFile) {
      return res.status(200).json({
        answer: answerFromFile
      });
    }

    // 🤖 otherwise use AI
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
            content: "You are a helpful academic assistant. Answer clearly in English."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    let answer = data?.choices?.[0]?.message?.content || "No response.";

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "Server error: " + err.message
    });
  }
}

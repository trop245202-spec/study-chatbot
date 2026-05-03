import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question;

    if (!question) {
      return res.status(400).json({ answer: "Please ask a question." });
    }

    const q = question.toLowerCase();

    // 📄 read knowledge
    const knowledge = fs.readFileSync(process.cwd() + "/data/knowledge.txt", "utf-8");

    let answerFromFile = "";

    // 🔍 keyword-based search
    if (q.includes("fee")) {
      answerFromFile = knowledge.match(/fees?.*?\./i)?.[0] || "";
    } else if (q.includes("time")) {
      answerFromFile = knowledge.match(/time.*?\./i)?.[0] || "";
    } else if (q.includes("course")) {
      answerFromFile = knowledge.match(/courses?.*?\./i)?.[0] || "";
    }

    // ✅ agar mil gaya → return
    if (answerFromFile) {
      return res.status(200).json({ answer: answerFromFile });
    }

    // 🧠 maths detect (important 🔥)
    const isMath = /[0-9+\-*/=()]/.test(q);

    // 🤖 AI call
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
            content: isMath
              ? "You are a math teacher. Solve step-by-step clearly."
              : "You are a helpful assistant. Answer clearly in English."
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
      answer = "Sorry, I couldn't find the answer.";
    }

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "Server error: " + err.message
    });
  }
}

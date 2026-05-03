import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question?.trim();
    const type = body?.type;

    if (!question) {
      return res.status(200).json({ answer: "Please ask something." });
    }

    // 📄 LOAD KNOWLEDGE SAFELY
    let knowledge = "";
    try {
      knowledge = fs.readFileSync(process.cwd() + "/data/knowledge.txt", "utf-8");
    } catch {
      knowledge = "";
    }

    // =======================
    // 📚 QUERY MODE (FILE SEARCH)
    // =======================
    if (type === "query") {
      const lowerQ = question.toLowerCase();

      const sentences = knowledge.split(".");
      const found = sentences.find(s => s.toLowerCase().includes(lowerQ));

      if (found) {
        return res.status(200).json({ answer: found.trim() });
      } else {
        return res.status(200).json({ answer: "Not found in knowledge." });
      }
    }

    // =======================
    // ⚡ QUICK MATH SOLVER (NO AI NEEDED)
    // =======================
    if (/^[0-9+\-*/(). ]+$/.test(question)) {
      try {
        const result = eval(question);
        return res.status(200).json({ answer: "Answer: " + result });
      } catch {}
    }

    // =======================
    // 🤖 AI MODE (SAFE)
    // =======================
    try {
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
              content: "You are a helpful assistant. Answer clearly and solve problems step-by-step."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });

      const text = await response.text();

      if (!text || text.startsWith("<")) {
        return res.status(200).json({ answer: "AI service issue. Try again." });
      }

      const data = JSON.parse(text);

      const answer = data?.choices?.[0]?.message?.content;

      if (answer) {
        return res.status(200).json({ answer });
      } else {
        return res.status(200).json({ answer: "AI did not respond properly." });
      }

    } catch (err) {
      return res.status(200).json({ answer: "AI error. Try again." });
    }

  } catch (err) {
    return res.status(200).json({ answer: "Server problem. Refresh page." });
  }
}

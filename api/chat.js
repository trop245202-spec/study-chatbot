import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question?.trim();
    const type = body?.type;

    if (!question) {
      return res.status(200).json({ answer: "Please ask something." });
    }

    // 📄 LOAD KNOWLEDGE
    let knowledge = "";
    try {
      knowledge = fs.readFileSync(process.cwd() + "/data/knowledge.txt", "utf-8");
    } catch {}

    // =======================
    // 📚 QUERY MODE
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
    // ⚡ SMART MATH DETECTION
    // =======================

    let cleanMath = question
      .toLowerCase()
      .replace(/what is|calculate|find|solve/g, "")
      .replace(/[^0-9+\-*/(). ]/g, "")
      .trim();

    if (cleanMath && /^[0-9+\-*/(). ]+$/.test(cleanMath)) {
      try {
        const result = eval(cleanMath);
        return res.status(200).json({ answer: "Answer: " + result });
      } catch {}
    }

    // =======================
    // 🧠 EQUATION DETECT
    // =======================
    const isEquation = /[a-zA-Z]/.test(question) && /=/.test(question);

    // =======================
    // 🤖 AI MODE (LAST OPTION)
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
              content: isEquation
                ? "You are a math expert. Solve equations step-by-step."
                : "You are a helpful assistant."
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

    } catch {
      return res.status(200).json({ answer: "AI error. Try again." });
    }

  } catch {
    return res.status(200).json({ answer: "Server problem. Refresh page." });
  }
}

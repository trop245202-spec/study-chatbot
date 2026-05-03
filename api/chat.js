import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question?.trim();
    const type = body?.type; // 🔥 query or question

    if (!question) {
      return res.status(400).json({ answer: "Please ask something." });
    }

    // =======================
    // 🔵 QUERY MODE (ONLY KNOWLEDGE)
    // =======================
    if (type === "query") {
      try {
        const knowledge = fs.readFileSync(
          process.cwd() + "/data/knowledge.txt",
          "utf-8"
        );

        const lowerQ = question.toLowerCase();
        const sentences = knowledge.split(".");

        const found = sentences.find(s =>
          s.toLowerCase().includes(lowerQ)
        );

        if (found) {
          return res.status(200).json({ answer: found.trim() });
        } else {
          return res.status(200).json({
            answer: "Not found in knowledge."
          });
        }

      } catch {
        return res.status(200).json({
          answer: "Knowledge file not found."
        });
      }
    }

    // =======================
    // 🟢 QUESTION MODE (MATH + AI)
    // =======================
    if (type === "question") {

      // ⚡ SMART MATH DETECTION
      let cleanMath = question
        .toLowerCase()
        .replace(/what is|calculate|find|solve/g, "")
        .replace(/[^0-9+\-*/(). ]/g, "")
        .trim();

      if (cleanMath && /^[0-9+\-*/(). ]+$/.test(cleanMath)) {
        try {
          const result = eval(cleanMath);
          return res.status(200).json({
            answer: "Answer: " + result
          });
        } catch {}
      }

      // 🤖 AI CALL
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
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
                  content:
                    "You are a helpful math and study assistant. Solve step-by-step and explain clearly."
                },
                {
                  role: "user",
                  content: question
                }
              ]
            })
          }
        );

        const text = await response.text();

        // ❌ HTML / empty response handle
        if (!text || text.startsWith("<")) {
          return res.status(200).json({
            answer: "AI service issue. Try again."
          });
        }

        const data = JSON.parse(text);

        let answer = data?.choices?.[0]?.message?.content;

        if (!answer) {
          answer = "AI did not respond properly.";
        }

        return res.status(200).json({ answer });

      } catch {
        return res.status(200).json({
          answer: "AI error. Try again."
        });
      }
    }

    // fallback
    return res.status(200).json({
      answer: "Invalid request type."
    });

  } catch {
    return res.status(200).json({
      answer: "Server error. Refresh page."
    });
  }
}

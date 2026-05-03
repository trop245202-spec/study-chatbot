import fs from "fs";

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question?.trim();
    const type = body?.type;

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
    // 🟢 QUESTION MODE (ONLY AI)
    // =======================
    if (type === "question") {
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
              model: "meta-llama/llama-3-8b-instruct",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful math and study assistant. Solve math step-by-step and explain clearly."
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

        // 🔍 handle HTML / empty
        if (!text || text.startsWith("<")) {
          return res.status(200).json({
            answer: "AI service issue. Try again."
          });
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return res.status(200).json({
            answer: "Invalid AI response."
          });
        }

        const answer = data?.choices?.[0]?.message?.content;

        if (answer) {
          return res.status(200).json({ answer });
        } else if (data?.error) {
          return res.status(200).json({
            answer: "API Error: " + data.error.message
          });
        } else {
          return res.status(200).json({
            answer: "AI did not respond properly."
          });
        }

      } catch (err) {
        return res.status(200).json({
          answer: "AI error: " + err.message
        });
      }
    }

    return res.status(200).json({
      answer: "Invalid request type."
    });

  } catch (err) {
    return res.status(200).json({
      answer: "Server error."
    });
  }
}

export default async function handler(req, res) {
  try {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question;

    if (!question) {
      return res.status(400).json({ answer: "No question provided." });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: question
        })
      }
    );

    const text = await response.text(); // 👈 IMPORTANT

    // 🔍 check if HTML aaya
    if (text.startsWith("<")) {
      return res.status(200).json({
        answer: "API returned HTML error. Model may be blocked or token issue."
      });
    }

    const data = JSON.parse(text);

    let answer = "No response";

    if (Array.isArray(data)) {
      answer = data[0]?.generated_text || answer;
    } else if (data.error) {
      answer = "Error: " + data.error;
    }

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "Server crash: " + err.message
    });
  }
}

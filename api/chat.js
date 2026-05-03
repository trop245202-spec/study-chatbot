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

    const data = await response.json();

    let answer = "No response";

    if (Array.isArray(data)) {
      answer = data[0]?.generated_text || answer;
    } else if (data.error) {
      answer = data.error;
    }

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      answer: "ERROR: " + err.message
    });
  }
}

export default async function handler(req, res) {
  try {
    // 🧾 parse body safely
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question;

    if (!question) {
      return res.status(400).json({ answer: "No question provided." });
    }

    const prompt = `
You are a helpful academic assistant.
Answer only in English.
Solve math step-by-step.

Question: ${question}
`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const data = await response.json();

    console.log("HF DATA:", data); // 🔍 log check ke liye

    let answer = "Something went wrong.";

    if (Array.isArray(data)) {
      answer = data[0]?.generated_text || answer;
    } else if (data.error) {
      answer = "Model loading or API error: " + data.error;
    }

    return res.status(200).json({ answer });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ answer: "Server error: " + err.message });
  }
}

export default async function handler(req, res) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ answer: "No question provided." });
    }

    // Professional English prompt
    const prompt = `
You are a professional academic assistant.

Rules:
- Answer only in English
- Be clear and structured
- For math problems: solve step-by-step
- For word problems: convert to equation first, then solve
- Keep explanation clean and easy to understand

Question: ${question}
`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer process.env.HF_TOKEN"
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    const data = await response.json();

    let answer = "Sorry, I couldn't understand.";

    if (Array.isArray(data)) {
      answer = data[0]?.generated_text || answer;
    } else if (data.error) {
      answer = "Model is loading, please try again.";
    }

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({ answer: "Server error occurred." });
  }
}

import fs from "fs";
import { evaluate } from "mathjs";

export default async function handler(req, res) {
  const { question } = JSON.parse(req.body || "{}");

  let q = question.toLowerCase();

  // 🧮 Simple math
  if (/^[0-9+\-*/(). ]+$/.test(q)) {
    try {
      let result = evaluate(q);
      return res.json({ answer: "Answer: " + result });
    } catch {}
  }

  // 📄 Load rules & knowledge
  let rules = fs.readFileSync("./data/rules.txt", "utf-8");
  let knowledge = fs.readFileSync("./data/knowledge.txt", "utf-8");

  let prompt = `
${rules}

Use this info if needed:
${knowledge}

Question: ${question}
`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_TOKEN",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const data = await response.json();

    res.json({
      answer: data[0]?.generated_text || "Samajh nahi aaya 😅"
    });

  } catch {
    res.json({ answer: "Error aa gaya 😓" });
  }
}

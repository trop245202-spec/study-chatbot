if (type === "question") {
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
            content: "You are a math and study assistant. Solve step-by-step clearly."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const text = await response.text(); // 👈 IMPORTANT

    // 🔍 debug: agar HTML ya empty aaye
    if (!text || text.startsWith("<")) {
      return res.status(200).json({
        answer: "AI service not responding properly. Try again."
      });
    }

    const data = JSON.parse(text);

    let answer = "";

    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message?.content || "";
    }

    if (!answer) {
      answer = "No answer received from AI.";
    }

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(200).json({
      answer: "AI error: " + err.message
    });
  }
}

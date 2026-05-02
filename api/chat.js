export default function handler(req, res) {
  const { question } = JSON.parse(req.body || "{}");

  let q = question.toLowerCase();
  let answer = "Samajh nahi aaya 😅";

  // Website related answers
  if (q.includes("fees")) {
    answer = "Fees ₹500/month hai";
  } 
  else if (q.includes("time")) {
    answer = "Timing: 5pm - 7pm";
  }
  else if (q.includes("course")) {
    answer = "Maths, Science aur English available hain";
  }

  // Math solver
  else {
    try {
      let result = eval(question);
      answer = "Answer: " + result;
    } catch {
      answer = "Simple math ya website related pooch 😄";
    }
  }

  res.status(200).json({ answer });
}

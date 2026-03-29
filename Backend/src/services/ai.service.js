const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// ✅ ZOD SCHEMA (MATCH WITH MONGOOSE)
const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number(),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),

  preparationRecommendations: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      task: z.string(),
    }),
  ),
});

// ✅ Retry (for rate limit)
async function generateWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    if (err.status === 429 && retries > 0) {
      console.log("Retrying...");
      await new Promise((res) => setTimeout(res, 30000));
      return generateWithRetry(fn, retries - 1);
    }
    throw err;
  }
}

// ✅ MAIN FUNCTION
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert interviewer.

Return ONLY valid JSON.

STRICT FORMAT:

{
  "title": "string",
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low | medium | high"
    }
  ],
  "preparationRecommendations": [
    {
      "day": number,
      "focus": "string",
      "task": "string"
    }
  ]
}

RULES:
- "title" should be a short job-role based heading
- DO NOT return strings inside arrays
- DO NOT stringify objects
- ALL arrays must contain OBJECTS
- minimum:
  - 3 technicalQuestions
  - 3 behavioralQuestions
  - 3 skillGaps
  - 5 preparationRecommendations

DATA:
Resume: ${resume.slice(0, 1000)}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  const response = await generateWithRetry(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.2,
      },
    }),
  );

  // ✅ FIX: correct text extraction
  let text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text || response.text;

  // 🔥 REMOVE ```json ... ``` wrapper
  text = text.trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
  }

  console.log("RAW AI RESPONSE:", text);

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }

  // ✅ VALIDATE WITH ZOD (VERY IMPORTANT)
  const validated = interviewReportSchema.safeParse(parsed);

  if (!validated.success) {
    console.error(validated.error);
    throw new Error("AI response format incorrect");
  }

  return validated.data;
}

module.exports = {
  generateInterviewReport,
};

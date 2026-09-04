const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

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

const resumeHtmlSchema = z.object({
  html: z.string(),
});

async function generateWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 429 && retries > 0) {
      await new Promise((res) => setTimeout(res, 30000));
      return generateWithRetry(fn, retries - 1);
    }
    throw err;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBlock(text = "") {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription, resumeDetails }) {
  const personal = resumeDetails?.personal || {};
  const section = (title, content) => content?.trim()
    ? `<h2>${escapeHtml(title)}</h2>${formatBlock(content)}`
    : "";
  const contact = [personal.phone, personal.email, personal.location, personal.linkedin, personal.github, personal.portfolio]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" &nbsp; | &nbsp; ");
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Generated Resume</title>
      <style>
        body {
          margin: 0;
          padding: 40px;
          font-family: Arial, sans-serif;
          color: #1f2937;
          background: #ffffff;
          line-height: 1.45;
        }
        .resume {
          max-width: 820px;
          margin: 0 auto;
        }
        h1 {
          margin: 0 0 10px;
          font-size: 28px;
          color: #111827;
        }
        h2 {
          margin: 22px 0 10px;
          padding-bottom: 6px;
          font-size: 15px;
          border-bottom: 1px solid #d1d5db;
          color: #111827;
        }
        p {
          margin: 0 0 8px;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div class="resume">
        <h1>${escapeHtml(personal.fullName || "Professional Resume")}</h1>
        <p>${contact}</p>
        ${section("Professional Summary", resumeDetails?.professionalSummary || selfDescription)}
        ${section("Technical Skills", resumeDetails?.technicalSkills)}
        ${section("Experience", resumeDetails?.experience)}
        ${section("Internships", resumeDetails?.internships)}
        ${section("Projects", resumeDetails?.projects)}
        ${section("Education", resumeDetails?.education)}
        ${section("Coding Profiles", resumeDetails?.codingProfiles)}
        ${section("Achievements", resumeDetails?.achievements)}
        ${section("Certifications", resumeDetails?.certifications)}
        ${section("Positions of Responsibility", resumeDetails?.responsibilities)}
        ${section("Extracurricular Activities", resumeDetails?.extracurriculars)}
        ${section("Languages", resumeDetails?.languages)}
      </div>
    </body>
  </html>
  `;
}

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

  let text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text || response.text;

  text = text.trim();

  if (text.startsWith("```")) {
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  }

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }

  const validated = interviewReportSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("AI response format incorrect");
  }

  return validated.data;
}

async function generateResumeHtml({ resume, selfDescription, jobDescription, resumeDetails }) {
  const prompt = `Generate a resume for a candidate with the following details:

Original Resume: ${resume.slice(0, 4000)}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
Candidate-verified Resume Information: ${JSON.stringify(resumeDetails)}

Return ONLY a JSON object with one field: "html".
Create a polished, ATS-friendly, single-column professional resume tailored to the job description.
Use candidate-verified information as the source of truth. Never invent employers, dates, degrees, metrics, links, skills, achievements, or projects.
Omit empty optional sections. Prioritize relevant skills naturally without keyword stuffing.
Use semantic HTML with inline CSS, white background, dark text, standard fonts, clear headings, and no icons, tables, photos, charts, columns, or progress bars.
Include only the sections for which the candidate supplied information.
Do not include markdown or extra explanation.`;

  try {
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
          responseMimeType: "application/json",
          responseSchema: zodToJsonSchema(resumeHtmlSchema),
          temperature: 0.2,
        },
      }),
    );

    const jsonContent = JSON.parse(response.text);
    return jsonContent.html;
  } catch (error) {
    if (error?.status === 429 || error?.status === 403) {
      return buildFallbackResumeHtml({ resume, selfDescription, jobDescription, resumeDetails });
    }

    throw error;
  }
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margins: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const html = await generateResumeHtml({
    resume,
    selfDescription,
    jobDescription,
  });

  return generatePdfFromHtml(html);
}

module.exports = {
  generateInterviewReport,
  generateResumeHtml,
  generateResumePdf,
  generatePdfFromHtml,
};

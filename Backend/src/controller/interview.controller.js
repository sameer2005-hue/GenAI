const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../model/interviewReport.model");

// ✅ Helper: safely parse string JSON
function parseIfString(item) {
  if (typeof item === "string") {
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }
  return item;
}

// ✅ Normalize Questions
function normalizeQuestions(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map(parseIfString)
    .filter(
      (q) =>
        q &&
        typeof q === "object" &&
        typeof q.question === "string" &&
        typeof q.intention === "string" &&
        typeof q.answer === "string",
    );
}

// ✅ Normalize Skill Gaps
function normalizeSkillGaps(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map(parseIfString)
    .filter((s) => s && typeof s.skill === "string")
    .map((s) => ({
      skill: s.skill,
      severity: ["low", "medium", "high"].includes(s.severity)
        ? s.severity
        : "medium",
    }));
}

// ✅ Normalize Preparation Plan
function normalizePreparation(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map(parseIfString)
    .filter((p) => p && typeof p.day === "number")
    .map((p) => ({
      day: p.day,
      focus: p.focus || "",
      task: p.task || "",
    }));
}

async function generateInterviewReportController(req, res) {
  try {
    // ✅ 1. Validate file
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const { selfDescription, jobDescription } = req.body;

    // ✅ 2. Validate inputs
    if (!selfDescription || !jobDescription) {
      return res.status(400).json({
        message: "Self description and job description are required",
      });
    }

    // ✅ 3. Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeContent = pdfData.text;

    if (!resumeContent || !resumeContent.trim()) {
      return res.status(400).json({
        message: "Could not extract text from PDF",
      });
    }

    // ✅ 4. Call AI
    const aiData = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    if (!aiData) {
      return res.status(500).json({
        message: "AI failed to generate response",
      });
    }

    // 🔥 5. IMPORTANT FIX: correct keys (match service + model)
    const technicalQuestions = normalizeQuestions(aiData.technicalQuestions);

    const behavioralQuestions = normalizeQuestions(aiData.behavioralQuestions);

    const skillGaps = normalizeSkillGaps(
      aiData.skillGaps, // ✅ FIX (was skillGap ❌)
    );

    const preparationRecommendations = normalizePreparation(
      aiData.preparationRecommendations, // ✅ FIX
    );

    const title =
      aiData.title ||
      jobDescription
        .split("\n")
        .map((line) => line.trim())
        .find(Boolean)
        ?.slice(0, 80) || "Interview Report";

    // ❗ 6. Final validation
    if (
      technicalQuestions.length < 3 ||
      behavioralQuestions.length < 3 ||
      skillGaps.length < 1 ||
      preparationRecommendations.length < 1
    ) {
      return res.status(500).json({
        message: "AI returned incomplete or invalid structured data",
      });
    }

    // ✅ 7. Save to DB
    const interviewReport = await interviewReportModel.create({
      user: req.user?.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      title,
      matchScore: aiData.matchScore || 0,

      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationRecommendations,
    });

    // ✅ 8. Response
    return res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Controller Error:", error);

    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
}


async function getInterviewReportController(req, res) {
  const {interviewId} = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user?.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found",
    });
  }

  return res.status(200).json({
    message: "Interview report retrieved successfully",
    interviewReport,
  });
}

async function getAllInterviewReportController(req, res) {
  const interviewReports = await interviewReportModel.find({
    user: req.user?.id,
  }).sort({ createdAt: -1 }).select("-resume -selfDesciption -jobDescription -__v -technicalQuestion -behavioralQuestions -skillGaps -preparatinalPlans"); // Exclude resume for listing

  res.status(200).json({
    message: "Interview reports retrieved successfully",
    interviewReports,
  });
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportController,
  getAllInterviewReportController,
};

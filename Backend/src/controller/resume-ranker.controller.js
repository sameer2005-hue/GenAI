const pdfParse = require("pdf-parse");
const { scoreResume } = require("../services/resume-ranker.service");

async function rankResumesController(req, res) {
  try {
    const files = req.files || [];
    const jobDescription = req.body.jobDescription?.trim();

    if (!jobDescription || jobDescription.length < 30) {
      return res.status(400).json({ message: "Please provide a detailed job description (at least 30 characters)." });
    }
    if (!files.length) {
      return res.status(400).json({ message: "Upload at least one PDF resume." });
    }
    if (files.some((file) => file.mimetype !== "application/pdf")) {
      return res.status(400).json({ message: "Only PDF resumes are supported." });
    }

    const parsed = await Promise.all(files.map(async (file) => {
      try {
        const data = await pdfParse(file.buffer);
        if (!data.text?.trim()) throw new Error("No readable text found");
        return { fileName: file.originalname, ...scoreResume(data.text, jobDescription) };
      } catch (error) {
        return { fileName: file.originalname, error: error.message || "Could not read this PDF" };
      }
    }));

    const rankings = parsed.filter((item) => !item.error).sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    const failedFiles = parsed.filter((item) => item.error);

    if (!rankings.length) return res.status(422).json({ message: "None of the uploaded PDFs contained readable text.", failedFiles });
    return res.json({ rankings, failedFiles, analyzedCount: rankings.length });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Each resume must be smaller than 3 MB." });
    return res.status(500).json({ message: error.message || "Resume ranking failed." });
  }
}

module.exports = { rankResumesController };

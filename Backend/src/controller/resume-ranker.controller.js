const pdfParse = require("pdf-parse");
const { scoreResume } = require("../services/resume-ranker.service");
const recruiterJobModel = require("../model/recruiterJob.model");

async function rankResumesController(req, res) {
  try {
    const files = req.files || [];
    const jobDescription = req.body.jobDescription?.trim();
    const title = req.body.title?.trim() || "Untitled role";

    if (!jobDescription || jobDescription.length < 30) {
      return res.status(400).json({ message: "Please provide a detailed job description (at least 30 characters)." });
    }
    if (!files.length) {
      return res.status(400).json({ message: "Upload at least one PDF resume." });
    }
    if (files.length > 100) {
      return res.status(400).json({ message: "You can rank a maximum of 100 resumes at once." });
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

    const job = await recruiterJobModel.create({
      recruiter: req.user.id,
      title: title.slice(0, 120),
      jobDescription,
      candidates: rankings,
    });
    return res.json({ jobId: job._id, title: job.title, rankings: job.candidates, failedFiles, analyzedCount: rankings.length });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Each resume must be smaller than 3 MB." });
    return res.status(500).json({ message: error.message || "Resume ranking failed." });
  }
}

async function getJobsController(req, res) {
  const jobs = await recruiterJobModel
    .find({ recruiter: req.user.id })
    .sort({ createdAt: -1 })
    .select("title jobDescription candidates createdAt updatedAt");
  return res.json({ jobs });
}

async function updateCandidateController(req, res) {
  const { jobId, candidateId } = req.params;
  const { status, notes } = req.body;
  const validStatuses = ["new", "shortlisted", "hold", "rejected"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid candidate status." });
  }
  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({ message: "Notes must be text." });
  }

  const job = await recruiterJobModel.findOne({ _id: jobId, recruiter: req.user.id });
  if (!job) return res.status(404).json({ message: "Job post not found." });
  const candidate = job.candidates.id(candidateId);
  if (!candidate) return res.status(404).json({ message: "Candidate not found." });

  if (status) candidate.status = status;
  if (notes !== undefined) candidate.notes = notes.slice(0, 2000);
  await job.save();
  return res.json({ candidate });
}

module.exports = { rankResumesController, getJobsController, updateCandidateController };

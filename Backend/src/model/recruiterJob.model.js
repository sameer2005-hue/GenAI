const { Schema, model } = require("mongoose");

const candidateSchema = new Schema(
  {
    fileName: { type: String, required: true },
    email: { type: String, default: "" },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    skills: [String],
    matchedSkills: [String],
    missingSkills: [String],
    education: [String],
    experienceYears: { type: Number, default: 0 },
    summary: String,
    status: { type: String, enum: ["new", "shortlisted", "hold", "rejected"], default: "new" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const recruiterJobSchema = new Schema(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    jobDescription: { type: String, required: true },
    candidates: [candidateSchema],
  },
  { timestamps: true },
);

module.exports = model("RecruiterJob", recruiterJobSchema);

const { Schema, model } = require("mongoose");

/**
 * -job Description : String
 * -resume Text: String
 * -self description: String
 * -matchScore: Number
 *
 * Technical question:
 * [{
 *  question: String,
 * intention: String,
 * answer: String,}]
 *
 * -Behavioral question:
 * [{
 *  question: String,
 * intention: String,
 * answer: String,}]
 *
 * -skill gap:
 * [{
 * skill: "",
 * severity:{
 * type: String,
 * enum: ["low", "medium", "high"]}
 * }]
 *
 * -preparation recommendation: String
 * [{
 * day: Number,
 * focus: String,
 * task: String}]
 */

const technicalQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false },
);

const behavioralQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false },
);

const skillGapSchema = new Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },
  },
  { _id: false },
);

const preparationRecommendationSchema = new Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"],
    },
    focus: {
      type: String,
      required: [true, "Focus is required"],
    },
    task: {
      type: String,
      required: [true, "Task is required"],
    },
  },
  { _id: false },
);

const interviewReportSchema = new Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    resume: {
      type: String,
    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationRecommendations: [preparationRecommendationSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
       required: [true, "Job title is required"],
    }
  },
  { timestamps: true },
);

const inteviewReportModel = model("InterviewReport", interviewReportSchema);
module.exports = inteviewReportModel;

const interviewRouter = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controller/interview.controller");
const upload = require("../middleware/file.middleware");

interviewRouter.use(authMiddleware.authUser, authMiddleware.requireRole("student"));

interviewRouter.post(
  "/",
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

interviewRouter.get(
  "/report/:interviewId",
  interviewController.getInterviewReportController,
);

interviewRouter.post(
  "/resume/preview/:interviewId",
  interviewController.generateResumePreviewController,
);

interviewRouter.post(
  "/resume/render-pdf",
  interviewController.renderResumePdfController,
);

interviewRouter.post(
  "/resume/save/:interviewId",
  interviewController.saveGeneratedResumeController,
);

interviewRouter.get(
  "/resume/saved/:interviewId/:resumeId",
  interviewController.getSavedResumeController,
);

interviewRouter.delete(
  "/resume/saved/:interviewId/:resumeId",
  interviewController.deleteSavedResumeController,
);

interviewRouter.get(
  "/",
  interviewController.getAllInterviewReportController,
);

interviewRouter.post(
  "/resume/pdf/:interviewId",
  interviewController.generateResumePdfController,
);

module.exports = interviewRouter;

const interviewRouter = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controller/interview.controller");
const upload = require("../middleware/file.middleware");

interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);


interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportController);

interviewRouter.post(
  "/resume/preview/:interviewId",
  authMiddleware.authUser,
  interviewController.generateResumePreviewController,
);

interviewRouter.post(
  "/resume/render-pdf",
  authMiddleware.authUser,
  interviewController.renderResumePdfController,
);

interviewRouter.post(
  "/resume/save/:interviewId",
  authMiddleware.authUser,
  interviewController.saveGeneratedResumeController,
);

interviewRouter.get(
  "/resume/saved/:interviewId/:resumeId",
  authMiddleware.authUser,
  interviewController.getSavedResumeController,
);

interviewRouter.delete(
  "/resume/saved/:interviewId/:resumeId",
  authMiddleware.authUser,
  interviewController.deleteSavedResumeController,
);

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportController);

interviewRouter.post("/resume/pdf/:interviewId", authMiddleware.authUser, interviewController.generateResumePdfController);

module.exports = interviewRouter;

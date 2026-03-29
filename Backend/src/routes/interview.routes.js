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


interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportController);

module.exports = interviewRouter;

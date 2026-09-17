const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/file.middleware");
const { rankResumesController, getJobsController, updateCandidateController } = require("../controller/resume-ranker.controller");

router.use(authMiddleware.authUser, authMiddleware.requireRole("recruiter"));

router.get("/jobs", getJobsController);
router.patch("/jobs/:jobId/candidates/:candidateId", updateCandidateController);

router.post(
  "/rank",
  upload.array("resumes", 100),
  rankResumesController,
);

module.exports = router;

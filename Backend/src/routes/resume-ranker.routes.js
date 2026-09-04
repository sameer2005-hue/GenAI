const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/file.middleware");
const { rankResumesController } = require("../controller/resume-ranker.controller");

router.post(
  "/rank",
  authMiddleware.authUser,
  upload.array("resumes", 10),
  rankResumesController,
);

module.exports = router;

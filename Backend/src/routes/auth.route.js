const router = require("express").Router();
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/logout", authController.loggedoutUser);
router.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = router;

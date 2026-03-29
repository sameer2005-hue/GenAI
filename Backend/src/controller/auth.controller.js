const userModel = require("../model/user.model");
const tokenBlacklistModel = require("../model/blackList.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
{ message: "Account already exist" }
  }

  const user = await userModel.create({
    username,
    email,
    password,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "user register successfully",
    status: "success",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPassValid = await user.comparePassword(password);

  if (!isPassValid) {
    return res.status(401).json({
      message: "Invalid email or password",
      status: "failed",
    });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "user logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function loggedoutUser(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access token is missing" });
  }

  res.clearCookie("token");

  await tokenBlacklistModel.create({ token });
  return res.status(200).json({ message: "User logged out successfully" });
}

async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "user fetch successfully",
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}

async function changePasswordController(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({ message: "Password updated successfully" });
}

module.exports = {
  registerUser,
  loginUser,
  loggedoutUser,
  getMeController,
  changePasswordController,
};

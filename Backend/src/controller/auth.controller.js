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
    return res.status(400).json({ messgae: "Accouont already exist" });
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
    messgae: "user register successfully",
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
    message: "user loggedin succesfully",
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
    message: "user fetch succesfully",
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}

module.exports = {
  registerUser,
  loginUser,
  loggedoutUser,
  getMeController,
};

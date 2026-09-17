const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../model/blackList.model")
const userModel = require("../model/user.model");

async function authUser(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access token is missing" });
  }

  const isTokenBlacklist = await tokenBlacklistModel.findOne({
    token
  })

  if(isTokenBlacklist){
    return res.status(401).json({message:"token is Invalid"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("role");
    if (!user) {
      return res.status(401).json({ message: "User account no longer exists" });
    }
    decoded.role = user.role || "student";
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        message: "You do not have permission to use this feature.",
      });
    }
    next();
  };
}

module.exports = { authUser, requireRole }

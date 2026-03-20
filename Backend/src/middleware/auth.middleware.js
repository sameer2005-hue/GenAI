const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../model/blackList.model")

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
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid token" });
  }
}


module.exports = {authUser}
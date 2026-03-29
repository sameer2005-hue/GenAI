const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const intervireRoute = require("./routes/interview.routes");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoute);
app.use("/api/interview", intervireRoute);

module.exports = app;

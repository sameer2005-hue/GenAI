const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const intervireRoute = require("./routes/interview.routes");
const resumeRankerRoute = require("./routes/resume-ranker.routes");
const cors = require("cors");
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use("/api/auth", authRoute);
// Feature APIs are isolated by account role; each router enforces the same role again.
app.use("/api/student/interview", intervireRoute);
app.use("/api/recruiter", resumeRankerRoute);

module.exports = app;

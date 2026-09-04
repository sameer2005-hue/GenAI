import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function rankResumes({ jobDescription, resumes }) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  resumes.forEach((resume) => formData.append("resumes", resume));
  const response = await api.post("/api/resume-ranker/rank", formData);
  return response.data;
}

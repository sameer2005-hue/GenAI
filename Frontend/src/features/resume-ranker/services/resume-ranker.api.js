import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function rankResumes({ title, jobDescription, resumes }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("jobDescription", jobDescription);
  resumes.forEach((resume) => formData.append("resumes", resume));
  const response = await api.post("/api/recruiter/rank", formData);
  return response.data;
}

export async function getJobs() {
  const response = await api.get("/api/recruiter/jobs");
  return response.data;
}

export async function updateCandidate(jobId, candidateId, updates) {
  const response = await api.patch(`/api/recruiter/jobs/${jobId}/candidates/${candidateId}`, updates);
  return response.data;
}

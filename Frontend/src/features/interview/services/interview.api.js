import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, // Important for sending cookies (JWT) with requests
})



export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}



export const getInterviewReportById = async (interviewId) =>{
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
}


export const getInterviewReports = async () =>{
    const response = await api.get("/api/interview");
    return response.data;
}


export const generateResumePdf = async ({interviewId}) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewId}`, null, {
        responseType: "blob", // Important for handling binary data
    });
    return response.data; // This will be the PDF blob
}

export const generateResumePreview = async ({ interviewId }) => {
    const response = await api.post(`/api/interview/resume/preview/${interviewId}`);
    return response.data;
}

export const renderResumePdf = async ({ html, title }) => {
    const response = await api.post(
        "/api/interview/resume/render-pdf",
        { html, title },
        {
            responseType: "blob",
        },
    );
    return response.data;
}

export const saveGeneratedResume = async ({ interviewId, title, html }) => {
    const response = await api.post(`/api/interview/resume/save/${interviewId}`, {
        title,
        html,
    });
    return response.data;
}

export const getSavedResume = async ({ interviewId, resumeId }) => {
    const response = await api.get(`/api/interview/resume/saved/${interviewId}/${resumeId}`);
    return response.data;
}

export const deleteSavedResume = async ({ interviewId, resumeId }) => {
    const response = await api.delete(`/api/interview/resume/saved/${interviewId}/${resumeId}`);
    return response.data;
}

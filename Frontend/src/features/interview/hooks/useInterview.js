import { useCallback, useContext } from "react";
import {
  generateInterviewReport,
  getInterviewReportById,
  getInterviewReports,
  generateResumePdf,
  generateResumePreview,
  renderResumePdf,
  saveGeneratedResume,
  getSavedResume,
  deleteSavedResume,
} from "../services/interview.api";
import { InterviewContext } from "../interview.context.jsx";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoadinq, report, setReport, reports, setReports } =
    context;

  const generateReport = useCallback(
    async ({ jobDescription, selfDescription, resumeFile }) => {
      setLoadinq(true);
      try {
        const response = await generateInterviewReport({
          jobDescription,
          selfDescription,
          resumeFile,
        });
        setReport(response.interviewReport);
        return response.interviewReport;
      } catch (error) {
        console.error("Error generating interview report:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq, setReport],
  );

  const fetchReportById = useCallback(
    async (interviewId) => {
      setLoadinq(true);
      try {
        const response = await getInterviewReportById(interviewId);
        setReport(response.interviewReport);
        return response.interviewReport;
      } catch (error) {
        console.error("Error fetching interview report:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq, setReport],
  );

  const fetchReports = useCallback(async () => {
    setLoadinq(true);
    try {
      const response = await getInterviewReports();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (error) {
      console.error("Error fetching interview reports:", error);
      throw error;
    } finally {
      setLoadinq(false);
    }
  }, [setLoadinq, setReports]);

  const getResumePdf = useCallback(
    async ({ interviewId }) => {
      setLoadinq(true);
      try {
        let response = await generateResumePdf({ interviewId });
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `resume_${interviewId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error("Error generating resume PDF:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq],
  );

  const getResumePreview = useCallback(
    async ({ interviewId, resumeDetails }) => {
      setLoadinq(true);
      try {
        const response = await generateResumePreview({ interviewId, resumeDetails });
        return response;
      } catch (error) {
        console.error("Error generating resume preview:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq],
  );

  const downloadResumeFromHtml = useCallback(
    async ({ html, title }) => {
      setLoadinq(true);
      try {
        const response = await renderResumePdf({ html, title });
        const url = window.URL.createObjectURL(
          new Blob([response], { type: "application/pdf" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${(title || "resume").replace(/\s+/g, "_").toLowerCase()}.pdf`,
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading rendered resume PDF:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq],
  );

  const saveResume = useCallback(
    async ({ interviewId, title, html }) => {
      setLoadinq(true);
      try {
        const response = await saveGeneratedResume({ interviewId, title, html });
        setReport((prev) =>
          prev
            ? { ...prev, savedResumes: response.savedResumes || prev.savedResumes }
            : prev,
        );
        return response;
      } catch (error) {
        console.error("Error saving resume:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq, setReport],
  );

  const fetchSavedResume = useCallback(
    async ({ interviewId, resumeId }) => {
      setLoadinq(true);
      try {
        const response = await getSavedResume({ interviewId, resumeId });
        return response.savedResume;
      } catch (error) {
        console.error("Error fetching saved resume:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq],
  );

  const removeSavedResume = useCallback(
    async ({ interviewId, resumeId }) => {
      setLoadinq(true);
      try {
        const response = await deleteSavedResume({ interviewId, resumeId });
        setReport((prev) =>
          prev
            ? { ...prev, savedResumes: response.savedResumes || [] }
            : prev,
        );
        return response;
      } catch (error) {
        console.error("Error deleting saved resume:", error);
        throw error;
      } finally {
        setLoadinq(false);
      }
    },
    [setLoadinq, setReport],
  );

  return {
    loading,
    report,
    reports,
    generateReport,
    fetchReportById,
    fetchReports,
    getResumePdf,
    getResumePreview,
    downloadResumeFromHtml,
    saveResume,
    fetchSavedResume,
    removeSavedResume,
  };
};

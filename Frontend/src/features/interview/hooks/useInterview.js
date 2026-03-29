import { useCallback, useContext } from "react";
import {
  generateInterviewReport,
  getInterviewReportById,
  getInterviewReports,
} from "../services/interview.api";
import { InterviewContext } from "../interview.context.jsx";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoadinq, report, setReport, reports, setReports } =
    context;

  const generateReport = useCallback(async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
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
  }, [setLoadinq, setReport]);

  const fetchReportById = useCallback(async (interviewId) => {
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
  }, [setLoadinq, setReport]);

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

  return {
    loading,
    report,
    reports,
    generateReport,
    fetchReportById,
    fetchReports,
  };
};

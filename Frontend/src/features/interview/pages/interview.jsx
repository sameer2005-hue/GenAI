import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/interview.scss";

const tabs = [
  { id: "technical", label: "Technical questions" },
  { id: "behavioral", label: "Behavioral questions" },
  { id: "roadmap", label: "Road Map" },
  { id: "resumes", label: "Resumes" },
];

function Interview() {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, report, fetchReportById, removeSavedResume } = useInterview();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "technical",
  );
  const [deletingResumeId, setDeletingResumeId] = useState("");

  useEffect(() => {
    if (interviewId) {
      fetchReportById(interviewId).catch((error) => {
        console.error("Failed to load interview report:", error);
      });
    }
  }, [fetchReportById, interviewId]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const activeContent = useMemo(() => {
    if (!report) {
      return {
        title: "Interview report",
        subtitle: "Loading your generated interview report...",
        items: [],
      };
    }

    if (activeTab === "technical") {
      return {
        title: "Technical questions",
        subtitle:
          "Project depth, architecture choices, and practical implementation clarity.",
        items: report.technicalQuestions || [],
      };
    }

    if (activeTab === "behavioral") {
      return {
        title: "Behavioral questions",
        subtitle:
          "Communication, teamwork, ownership, and growth mindset preparation.",
        items: report.behavioralQuestions || [],
      };
    }

    if (activeTab === "resumes") {
      return {
        title: "Saved resumes",
        subtitle:
          "Open a saved version anytime, review it, and download the final PDF when needed.",
        items: report.savedResumes || [],
      };
    }

    return {
      title: "7-day preparation road map",
      subtitle:
        "A focused revision plan to improve match quality before the interview.",
      items: report.preparationRecommendations || [],
    };
  }, [activeTab, report]);

  const handleResumePreview = () => {
    navigate(`/interview/${interviewId}/resume-preview`);
  };

  const handleDeleteResume = async (resumeId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this saved resume?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingResumeId(resumeId);
      await removeSavedResume({ interviewId, resumeId });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Resume delete failed. Please try again.",
      );
    } finally {
      setDeletingResumeId("");
    }
  };

  if (loading && !report) {
    return (
      <main className="interview-page">
        <section className="interview-shell interview-empty-state">
          <p>Loading interview report...</p>
        </section>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="interview-page">
        <section className="interview-shell interview-empty-state">
          <p>No interview report found for this id.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="interview-page">
      <section className="interview-shell">
        <aside className="interview-sidebar">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/app")}
          >
            Back
          </button>

          <div className="sidebar-header">
            <p className="panel-kicker">Interview Report</p>
            <h1>{report.title || "Preparation dashboard"}</h1>
          </div>

          <nav className="sidebar-nav" aria-label="Interview sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="score-card">
            <span>Match Score</span>
            <strong>{report.matchScore}%</strong>
            <p>Strong alignment with the target role and resume context.</p>
          </div>

          <button
            type="button"
            className="download-resume-btn sidebar-download-btn"
            onClick={handleResumePreview}
          >
            Generate Resume
          </button>
        </aside>

        <section className="interview-content">
          <header className="content-header">
            <div className="report-title-banner">
              <span className="report-title-label">Report Title</span>
              <h2>{report.title || "Interview Report"}</h2>
            </div>
            <p className="panel-kicker">Selected Section</p>
            <h3>{activeContent.title}</h3>
            <p>{activeContent.subtitle}</p>
          </header>

          <div className="content-scroll">
            {activeTab === "resumes" ? (
              activeContent.items.length > 0 ? (
                activeContent.items.map((item) => (
                  <article className="saved-resume-card" key={item._id}>
                    <div className="saved-resume-copy">
                      <span className="saved-resume-label">Saved Resume</span>
                      <h3>{item.title}</h3>
                      <p>
                        Saved on{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="saved-resume-actions">
                      <button
                        type="button"
                        className="open-resume-btn"
                        onClick={() =>
                          navigate(
                            `/interview/${interviewId}/resume-preview/${item._id}`,
                          )
                        }
                      >
                        Open Resume
                      </button>
                      <button
                        type="button"
                        className="delete-resume-btn"
                        onClick={() => handleDeleteResume(item._id)}
                        disabled={deletingResumeId === item._id}
                      >
                        {deletingResumeId === item._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-resume-state">
                  <h3>No saved resumes yet</h3>
                  <p>
                    Generate a resume preview first, then save it with a custom
                    title to see it here.
                  </p>
                </div>
              )
            ) : activeTab !== "roadmap"
              ? activeContent.items.map((item, index) => (
                  <article className="question-card" key={item.question}>
                    <div className="question-index">Q{index + 1}</div>
                    <div className="question-body">
                      <h3>{item.question}</h3>
                      <div className="question-block">
                        <span>Interviewer intention</span>
                        <p>{item.intention}</p>
                      </div>
                      <div className="question-block">
                        <span>Expected answer direction</span>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </article>
                ))
              : activeContent.items.map((item) => (
                  <article className="roadmap-card" key={item.day}>
                    <div className="roadmap-day">Day {item.day}</div>
                    <div className="roadmap-body">
                      <h3>{item.focus}</h3>
                      <p>{item.task}</p>
                    </div>
                  </article>
                ))}
          </div>
        </section>

        <aside className="interview-insights">
          <div className="insight-panel">
            <p className="panel-kicker">Skill Gaps</p>
            <div className="skill-gap-list">
              {(report.skillGaps || []).map((gap) => (
                <span
                  key={gap.skill}
                  className={`skill-pill severity-${gap.severity}`}
                >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>

          <div className="insight-panel insight-note">
            <p className="panel-kicker">Focus Note</p>
            <h3>What to strengthen first</h3>
            <p>
              Prioritize system design, testing, and scalability examples while
              preparing project explanations.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Interview;

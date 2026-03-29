import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/interview.scss";

const tabs = [
  { id: "technical", label: "Technical questions" },
  { id: "behavioral", label: "Behavioral questions" },
  { id: "roadmap", label: "Road Map" },
];

function Interview() {
  const { interviewId } = useParams();
  const { loading, report, fetchReportById } = useInterview();
  const [activeTab, setActiveTab] = useState("technical");

  useEffect(() => {
    if (interviewId) {
      fetchReportById(interviewId).catch((error) => {
        console.error("Failed to load interview report:", error);
      });
    }
  }, [fetchReportById, interviewId]);

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

    return {
      title: "7-day preparation road map",
      subtitle:
        "A focused revision plan to improve match quality before the interview.",
      items: report.preparationRecommendations || [],
    };
  }, [activeTab, report]);

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
            {activeTab !== "roadmap"
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

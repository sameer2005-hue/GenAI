import React from "react";
import { Link, useNavigate } from "react-router";
import "../style/landing.scss";

const features = [
  {
    title: "Resume-based interview reports",
    description:
      "Generate practical interview prep from your resume and target role.",
  },
  {
    title: "Technical and behavioral questions",
    description:
      "Get focused questions with answer direction and interviewer intent.",
  },
  {
    title: "Skill gaps and roadmap",
    description:
      "See where to improve and follow a structured preparation plan.",
  },
  {
    title: "AI resume generation",
    description:
      "Preview, save, reopen, and download tailored resumes in one place.",
  },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <section className="landing-shell">
        <header className="landing-navbar">
          <div className="landing-brand">
            <span className="brand-mark">AI</span>
            <div>
              <strong>Interview Prep Studio</strong>
              <p>Smarter practice from your resume</p>
            </div>
          </div>

          <nav className="landing-nav-actions">
            <Link to="/login" className="nav-link-btn">
              Login
            </Link>
            <Link to="/register" className="nav-link-btn primary">
              Sign Up
            </Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-copy">
            <p className="landing-kicker">AI Interview Preparation Platform</p>
            <h1>Turn your resume into a complete interview practice workflow.</h1>
            <p className="landing-description">
              Upload your resume, match it with a target role, generate tailored
              questions, build a roadmap, and create polished resume versions in
              one smooth experience.
            </p>

            <div className="landing-cta-group">
              <button
                type="button"
                className="landing-cta primary"
                onClick={() => navigate("/login")}
              >
                Generate Interview Report
              </button>
              <Link to="/register" className="landing-cta secondary">
                Create Account
              </Link>
            </div>
          </div>

          <div className="landing-preview-card">
            <p className="landing-card-label">Inside the project</p>
            <h2>What you can do here</h2>
            <div className="landing-feature-list">
              {features.map((feature) => (
                <article className="landing-feature-card" key={feature.title}>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Landing;

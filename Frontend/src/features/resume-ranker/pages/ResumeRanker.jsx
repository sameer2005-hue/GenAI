import { useState } from "react";
import { useNavigate } from "react-router";
import { rankResumes } from "../services/resume-ranker.api";
import "../style/resume-ranker.scss";

function SkillList({ label, items, tone }) {
  return (
    <div className="skill-row">
      <span className="skill-label">{label}</span>
      <div className="skill-list">
        {items?.length ? items.map((item) => <span className={`skill ${tone}`} key={item}>{item}</span>) : <span className="none">None detected</span>}
      </div>
    </div>
  );
}

export default function ResumeRanker() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (event) => {
    setFiles(Array.from(event.target.files || []).slice(0, 10));
    setResults(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (jobDescription.trim().length < 30 || !files.length) {
      setError("Add a detailed job description and at least one PDF resume.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResults(await rankResumes({ jobDescription, resumes: files }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to rank resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ranker-page">
      <div className="ranker-shell">
        <header className="ranker-header">
          <button type="button" className="back-button" onClick={() => navigate("/app")}>← Dashboard</button>
          <div><p className="eyebrow">Candidate intelligence</p><h1>Resume Ranker</h1><p>Compare up to 10 resumes against one role with transparent, requirement-based scoring.</p></div>
        </header>

        <form className="ranker-form" onSubmit={handleSubmit}>
          <label>Job description<textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste responsibilities, required skills, experience, and education..." /></label>
          <label className="upload-zone">
            <input type="file" accept="application/pdf,.pdf" multiple onChange={handleFiles} />
            <strong>{files.length ? `${files.length} resume${files.length > 1 ? "s" : ""} selected` : "Choose PDF resumes"}</strong>
            <span>Maximum 10 files · 3 MB each</span>
          </label>
          {files.length > 0 && <div className="file-chips">{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}</div>}
          {error && <p className="ranker-error">{error}</p>}
          <button className="rank-button" disabled={loading}>{loading ? "Analyzing candidates..." : "Rank resumes"}</button>
        </form>

        {results && <section className="results-section">
          <div className="results-heading"><div><p className="eyebrow">Ranked shortlist</p><h2>{results.analyzedCount} candidate{results.analyzedCount !== 1 ? "s" : ""} analyzed</h2></div><span>Skills 65% · Experience 25% · Education 10%</span></div>
          <div className="ranking-list">{results.rankings.map((candidate) => (
            <article className="candidate-card" key={candidate.fileName}>
              <div className="candidate-summary"><span className="rank">#{candidate.rank}</span><div><h3>{candidate.fileName}</h3><p>{candidate.summary}</p></div><div className={`score ${candidate.score >= 75 ? "strong" : candidate.score >= 50 ? "medium" : "low"}`}><strong>{candidate.score}</strong><span>match</span></div></div>
              <div className="candidate-facts"><span><strong>{candidate.experienceYears}</strong> years detected</span><span><strong>{candidate.education.join(", ") || "Not found"}</strong> education</span></div>
              <SkillList label="Matched" items={candidate.matchedSkills} tone="matched" />
              <SkillList label="Missing" items={candidate.missingSkills} tone="missing" />
            </article>
          ))}</div>
          {results.failedFiles?.length > 0 && <p className="failed-files">Could not read: {results.failedFiles.map((file) => file.fileName).join(", ")}</p>}
        </section>}
      </div>
    </main>
  );
}

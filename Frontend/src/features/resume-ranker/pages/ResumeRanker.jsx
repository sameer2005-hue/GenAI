import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  getJobs,
  rankResumes,
  updateCandidate,
} from "../services/resume-ranker.api";
import { useAuth } from "../../auth/hooks/useAuth";
import "../style/resume-ranker.scss";

const statuses = ["new", "shortlisted", "hold", "rejected"];
const statusFilters = [
  { value: "all", label: "All candidates" },
  { value: "new", label: "New" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "hold", label: "Hold" },
  { value: "rejected", label: "Rejected" },
];
const Skills = ({ label, items, tone }) => (
  <div className="skill-row">
    <span className="skill-label">{label}</span>
    <div className="skill-list">
      {items?.length ? (
        items.map((item) => (
          <span className={`skill ${tone}`} key={item}>
            {item}
          </span>
        ))
      ) : (
        <span className="none">None detected</span>
      )}
    </div>
  </div>
);

export default function ResumeRanker() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [stage, setStage] = useState("all");
  const [skill, setSkill] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [notes, setNotes] = useState({});
  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.jobs || []);
      setActiveJobId((id) => id || data.jobs?.[0]?._id || "");
    } catch (e) {
      setError(e.response?.data?.message || "Could not load saved job posts.");
    }
  };
  useEffect(() => {
    loadJobs();
  }, []);
  const activeJob = jobs.find((job) => job._id === activeJobId);
  const candidates = activeJob?.candidates || [];
  const filtered = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.score >= Number(minScore) &&
          (stage === "all" || c.status === stage) &&
          (!skill.trim() ||
            c.skills?.some((s) => s.includes(skill.trim().toLowerCase()))),
      ),
    [candidates, minScore, stage, skill],
  );
  const selected = candidates.filter((c) => compareIds.includes(c._id));
  const average = candidates.length
    ? Math.round(
        candidates.reduce((total, c) => total + c.score, 0) / candidates.length,
      )
    : 0;
  const update = async (candidate, data) => {
    try {
      const result = await updateCandidate(activeJobId, candidate._id, data);
      setJobs((all) =>
        all.map((job) =>
          job._id === activeJobId
            ? {
                ...job,
                candidates: job.candidates.map((c) =>
                  c._id === result.candidate._id ? result.candidate : c,
                ),
              }
            : job,
        ),
      );
    } catch (e) {
      setError(e.response?.data?.message || "Could not save candidate update.");
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (jobDescription.trim().length < 30 || !files.length)
      return setError(
        "Add a detailed job description and at least one PDF resume.",
      );
    setLoading(true);
    setError("");
    try {
      const data = await rankResumes({
        title: title.trim() || "Untitled role",
        jobDescription,
        resumes: files,
      });
      await loadJobs();
      setActiveJobId(data.jobId);
      setCompareIds([]);
      setFiles([]);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to rank resumes.");
    } finally {
      setLoading(false);
    }
  };
  const exportCsv = () => {
    const rows = [
      [
        "Rank",
        "Resume",
        "Score",
        "Experience",
        "Status",
        "Matched skills",
        "Notes",
      ],
      ...candidates.map((c) => [
        c.rank,
        c.fileName,
        c.score,
        c.experienceYears,
        c.status,
        c.matchedSkills?.join(" | "),
        c.notes || "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeJob.title}-shortlist.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="ranker-page">
      <div className="ranker-shell">
        <header className="ranker-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/app")}
          >
            ← Dashboard
          </button>
          <div>
            <p className="eyebrow">
              Recruiter workspace · Candidate intelligence
            </p>
            <h1>Hiring dashboard</h1>
            <p>
              Save job posts, rank up to 100 resumes, and manage your hiring
              pipeline.
            </p>
          </div>
          <div className="recruiter-profile">
            <span>{user?.username?.slice(0, 2).toUpperCase() || "RC"}</span>
            <div>
              <strong>{user?.username || "Recruiter"}</strong>
              <small>{user?.email}</small>
              <em>Recruiter account</em>
            </div>
            <button
              onClick={async () => {
                await handleLogout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <form className="ranker-form" onSubmit={submit}>
          <label>
            Job title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </label>
          <label>
            <p className="para">Job description</p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste responsibilities, required skills, experience, and education..."
            />
          </label>
          <label className="upload-zone">
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(e) => {
                const chosen = Array.from(e.target.files || []);
                chosen.length > 100
                  ? setError("Maximum 100 resumes allowed.")
                  : (setFiles(chosen), setError(""));
              }}
            />
            <strong>
              {files.length
                ? `${files.length} resumes selected`
                : "Choose PDF resumes"}
            </strong>
            <span>Maximum 100 files · 3 MB each</span>
          </label>
          {files.length > 0 && (
            <div className="file-chips">
              {files.slice(0, 8).map((file) => (
                <span key={`${file.name}-${file.size}`}>{file.name}</span>
              ))}
              {files.length > 8 && <span>+{files.length - 8} more</span>}
            </div>
          )}
          {error && <p className="ranker-error">{error}</p>}
          <button className="rank-button" disabled={loading}>
            {loading ? "Analyzing candidates..." : "Save job & rank resumes"}
          </button>
        </form>
        <section className="job-toolbar">
          <label>
            Saved job posts
            <select
              value={activeJobId}
              onChange={(e) => {
                setActiveJobId(e.target.value);
                setCompareIds([]);
              }}
            >
              <option value="">Select a job post</option>
              {jobs.map((job) => (
                <option value={job._id} key={job._id}>
                  {job.title} · {job.candidates.length} candidates
                </option>
              ))}
            </select>
          </label>
          {activeJob && (
            <button className="export-button" onClick={exportCsv}>
              Export CSV
            </button>
          )}
        </section>
        {activeJob && (
          <section className="results-section">
            <div className="analytics-grid">
              <div>
                <span>Candidates</span>
                <strong>{candidates.length}</strong>
              </div>
              <div>
                <span>Average match</span>
                <strong>{average}%</strong>
              </div>
              <div>
                <span>Shortlisted</span>
                <strong>
                  {candidates.filter((c) => c.status === "shortlisted").length}
                </strong>
              </div>
              <div>
                <span>Pipeline stage</span>
                <strong>
                  {candidates.some((c) => c.status === "shortlisted")
                    ? "Screening"
                    : "Review"}
                </strong>
              </div>
            </div>
            <div className="results-heading">
              <div>
                <p className="eyebrow">Ranked shortlist</p>
                <h2>{activeJob.title}</h2>
              </div>
              <span>Skills 65% · Experience 25% · Education 10%</span>
            </div>
            <div className="filters">
              <label>
                Min. match
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                />
              </label>
              <div className="status-filter">
                <span className="filter-label">Pipeline status</span>
                <div className="status-options" role="group" aria-label="Filter candidates by pipeline status">
                  {statusFilters.map(({ value, label }) => {
                    const count = value === "all"
                      ? candidates.length
                      : candidates.filter((candidate) => (candidate.status || "new") === value).length;
                    return (
                      <button
                        type="button"
                        className={stage === value ? "status-option active" : "status-option"}
                        aria-pressed={stage === value}
                        onClick={() => setStage(value)}
                        key={value}
                      >
                        <span>{label}</span>
                        <strong>{count}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
              <label>
                Skill
                <input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="e.g. react"
                />
              </label>
            </div>
            {selected.length > 0 && (
              <section className="comparison">
                <p className="eyebrow">Candidate comparison (up to 3)</p>
                <div>
                  {selected.map((c) => (
                    <article key={c._id}>
                      <strong>{c.fileName}</strong>
                      <b>{c.score}% match</b>
                      <span>
                        {c.experienceYears} years · {c.status}
                      </span>
                      <small>
                        {c.matchedSkills?.join(", ") || "No skills detected"}
                      </small>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <div className="ranking-list">
              {filtered.map((c) => (
                <article className="candidate-card" key={c._id}>
                  <div className="candidate-summary">
                    <span className="rank">#{c.rank}</span>
                    <div>
                      <h3>{c.fileName}</h3>
                      <p>{c.summary}</p>
                    </div>
                    <div
                      className={`score ${c.score >= 75 ? "strong" : c.score >= 50 ? "medium" : "low"}`}
                    >
                      <strong>{c.score}</strong>
                      <span>match</span>
                    </div>
                  </div>
                  <div className="candidate-actions">
                    <button
                      className={
                        compareIds.includes(c._id)
                          ? "compare selected"
                          : "compare"
                      }
                      onClick={() =>
                        setCompareIds((ids) =>
                          ids.includes(c._id)
                            ? ids.filter((id) => id !== c._id)
                            : ids.length < 3
                              ? [...ids, c._id]
                              : ids,
                        )
                      }
                    >
                      Compare
                    </button>
                    {c.email && (
                      <a
                        className="email-template"
                        href={`mailto:${c.email}?subject=${encodeURIComponent(`Update on your ${activeJob.title} application`)}&body=${encodeURIComponent(`Hi,\n\nThank you for applying for the ${activeJob.title} role. We would like to share an update on your application.\n\nRegards,\nHiring Team`)}`}
                      >
                        Email candidate
                      </a>
                    )}
                    <label>
                      Pipeline
                      <select
                        value={c.status || "new"}
                        onChange={(e) => update(c, { status: e.target.value })}
                      >
                        {statuses.map((s) => (
                          <option value={s} key={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="candidate-facts">
                    <span>
                      <strong>{c.experienceYears}</strong> years detected
                    </span>
                    <span>
                      <strong>{c.education?.join(", ") || "Not found"}</strong>{" "}
                      education
                    </span>
                  </div>
                  <Skills
                    label="Matched"
                    items={c.matchedSkills}
                    tone="matched"
                  />
                  <Skills
                    label="Missing"
                    items={c.missingSkills}
                    tone="missing"
                  />
                  <div className="ai-insight">
                    <strong>AI interview insight</strong>
                    <p>
                      Ask about{" "}
                      {c.missingSkills?.slice(0, 2).join(" and ") ||
                        "the role requirements"}
                      : “Tell me about a relevant project and your impact.”
                    </p>
                  </div>
                  <div className="notes">
                    <textarea
                      value={notes[c._id] ?? c.notes ?? ""}
                      onChange={(e) =>
                        setNotes((all) => ({ ...all, [c._id]: e.target.value }))
                      }
                      placeholder="Recruiter notes and follow-up feedback..."
                    />
                    <button
                      onClick={() =>
                        update(c, { notes: notes[c._id] ?? c.notes ?? "" })
                      }
                    >
                      Save note
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <p className="empty-results">
                No candidate matches the selected filters.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

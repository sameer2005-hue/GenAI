import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import "../style/resume-details.scss";

const initialDetails = {
  personal: { fullName: "", phone: "", email: "", location: "", linkedin: "", github: "", portfolio: "" },
  targetRole: "", professionalSummary: "", education: "", technicalSkills: "",
  projects: "", experience: "", internships: "", codingProfiles: "", achievements: "",
  certifications: "", responsibilities: "", extracurriculars: "", languages: "",
};

const sections = [
  ["education", "Education", "College/university, degree, branch, CGPA/percentage, start–end year"],
  ["technicalSkills", "Technical Skills *", "Languages, frontend, backend, databases, tools (group them clearly)"],
  ["projects", "Projects", "For each: name, tech stack, description, features, challenges, GitHub and live link"],
  ["experience", "Experience", "Company, role, duration, responsibilities and measurable achievements"],
  ["internships", "Internships", "Company, role, duration, technologies and work completed"],
  ["codingProfiles", "Coding Profiles", "Platform, profile link, rating, solved problems and rank"],
  ["achievements", "Achievements", "Contests, hackathons, scholarships, ranks or measurable milestones"],
  ["certifications", "Certifications", "Certification name, issuer and year"],
  ["responsibilities", "Positions of Responsibility", "Role, organization and contribution"],
  ["extracurriculars", "Extracurricular Activities", "Sports, open source, volunteering, blogging, etc."],
  ["languages", "Languages Known", "Example: English — Professional, Hindi — Native"],
];

export default function ResumeDetails() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const storageKey = `resume-details-${interviewId}`;
  const [details, setDetails] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(storageKey)) || initialDetails; } catch { return initialDetails; }
  });
  const [error, setError] = useState("");

  const setPersonal = (field, value) => setDetails((current) => ({ ...current, personal: { ...current.personal, [field]: value } }));
  const setField = (field, value) => setDetails((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    const { fullName, email, phone } = details.personal;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !details.technicalSkills.trim()) {
      setError("Full name, phone, email and technical skills are required.");
      return;
    }
    sessionStorage.setItem(storageKey, JSON.stringify(details));
    navigate(`/interview/${interviewId}/resume-preview`);
  };

  return <main className="resume-details-page"><section className="resume-details-shell">
    <header><button type="button" onClick={() => navigate(`/interview/${interviewId}`)}>← Report</button><div><p className="kicker">Verified candidate information</p><h1>Build your ATS resume</h1><p>Only provide truthful information. Empty optional sections will be omitted and your job analysis will be used only to tailor wording and priority.</p></div></header>
    <form onSubmit={submit}>
      <fieldset><legend>1. Personal Information</legend><div className="details-grid">
        {[ ["fullName","Full Name *","text"], ["phone","Phone *","tel"], ["email","Email *","email"], ["location","City, State","text"], ["linkedin","LinkedIn Profile","url"], ["github","GitHub Profile","url"], ["portfolio","Portfolio Website","url"] ].map(([field,label,type]) => <label key={field}>{label}<input type={type} value={details.personal[field]} onChange={(e) => setPersonal(field,e.target.value)} /></label>)}
      </div></fieldset>
      <fieldset><legend>2. Career Direction</legend><div className="details-grid two"><label>Target Role<input value={details.targetRole} onChange={(e) => setField("targetRole",e.target.value)} placeholder="Backend Developer, SDE, MERN Developer..." /></label><label>Professional Summary<textarea value={details.professionalSummary} onChange={(e) => setField("professionalSummary",e.target.value)} placeholder="Optional 2–4 line summary; AI can refine it without inventing facts." /></label></div></fieldset>
      {sections.map(([field,label,placeholder], index) => <fieldset key={field}><legend>{index + 3}. {label}</legend><textarea value={details[field]} onChange={(e) => setField(field,e.target.value)} placeholder={placeholder} /></fieldset>)}
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions"><button type="button" className="secondary" onClick={() => navigate(`/interview/${interviewId}`)}>Cancel</button><button type="submit" className="primary">Generate ATS Resume</button></div>
    </form>
  </section></main>;
}

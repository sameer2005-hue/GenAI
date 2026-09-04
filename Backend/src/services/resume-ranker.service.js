const SKILLS = [
  "javascript", "typescript", "react", "next.js", "node.js", "express", "python",
  "java", "c++", "c#", "php", "ruby", "go", "rust", "html", "css", "sass",
  "tailwind", "redux", "angular", "vue", "django", "flask", "spring", ".net",
  "mongodb", "mysql", "postgresql", "sql", "redis", "firebase", "supabase",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "git",
  "github", "rest api", "graphql", "microservices", "machine learning", "deep learning",
  "nlp", "generative ai", "llm", "pandas", "numpy", "tensorflow", "pytorch",
  "figma", "ui/ux", "agile", "scrum", "jira", "power bi", "tableau", "excel",
  "communication", "leadership", "problem solving", "project management",
];

const EDUCATION_LEVELS = [
  { label: "Doctorate", patterns: ["phd", "ph.d", "doctorate"] },
  { label: "Master's", patterns: ["master", "m.tech", "mtech", "mba", "m.sc", "msc", "mca"] },
  { label: "Bachelor's", patterns: ["bachelor", "b.tech", "btech", "b.e", "bsc", "b.sc", "bca"] },
  { label: "Diploma", patterns: ["diploma", "associate degree"] },
];

const normalize = (text = "") => text.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ");
const containsTerm = (text, term) => new RegExp(`(^|[^a-z0-9+#.])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#.]|$)`, "i").test(text);

function extractSkills(text) {
  const normalized = normalize(text);
  return SKILLS.filter((skill) => containsTerm(normalized, skill));
}

function extractEducation(text) {
  const normalized = normalize(text);
  return EDUCATION_LEVELS.filter(({ patterns }) => patterns.some((item) => containsTerm(normalized, item)))
    .map(({ label }) => label);
}

function extractExperience(text) {
  const normalized = normalize(text);
  const matches = [...normalized.matchAll(/(?:over\s+|more than\s+)?(\d{1,2})(?:\+)?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:professional\s+)?experience/g)];
  const ranges = [...normalized.matchAll(/(20\d{2}|19\d{2})\s*(?:-|to)\s*(present|current|20\d{2}|19\d{2})/g)];
  const stated = matches.map((match) => Number(match[1]));
  const ranged = ranges.map((match) => (/(present|current)/.test(match[2]) ? new Date().getFullYear() : Number(match[2])) - Number(match[1]));
  return Math.min(40, Math.max(0, ...stated, ...ranged, 0));
}

function extractRequiredYears(jobDescription) {
  const matches = [...normalize(jobDescription).matchAll(/(\d{1,2})(?:\+)?\s*(?:years?|yrs?)/g)];
  return matches.length ? Math.max(...matches.map((match) => Number(match[1]))) : 0;
}

function scoreResume(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const requiredSkills = extractSkills(jobDescription);
  const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));
  const experienceYears = extractExperience(resumeText);
  const requiredYears = extractRequiredYears(jobDescription);
  const education = extractEducation(resumeText);
  const requiredEducation = extractEducation(jobDescription);
  const educationMatches = requiredEducation.length === 0 || requiredEducation.some((level) => education.includes(level));

  const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 65 : 45;
  const experienceScore = requiredYears ? Math.min(experienceYears / requiredYears, 1) * 25 : Math.min(experienceYears / 3, 1) * 20 + 5;
  const educationScore = requiredEducation.length ? (educationMatches ? 10 : 2) : (education.length ? 10 : 6);
  const score = Math.max(0, Math.min(100, Math.round(skillScore + experienceScore + educationScore)));

  return {
    score,
    skills: resumeSkills,
    matchedSkills,
    missingSkills,
    education,
    experienceYears,
    summary: `${matchedSkills.length}/${requiredSkills.length || 0} identified job skills matched${requiredYears ? `; ${experienceYears} of ${requiredYears}+ required years detected` : ""}.`,
  };
}

module.exports = { scoreResume };

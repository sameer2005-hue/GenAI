import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";

function Home() {
  const { loading, generateReport, reports, fetchReports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();

  useEffect(() => {
    fetchReports().catch((error) => {
      console.error("Failed to load interview reports:", error);
    });
  }, [fetchReports]);

  const { user, handleLogout, handleChangePassword } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [editorPopup, setEditorPopup] = useState({
    field: "",
    open: false,
  });
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const passwordPopupRef = useRef(null);
  const editorPopupRef = useRef(null);

  const userInitials = useMemo(() => {
    const name = user?.username?.trim() || "User";
    return name.slice(0, 2).toUpperCase();
  }, [user?.username]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (
        passwordPopupRef.current &&
        !passwordPopupRef.current.contains(event.target)
      ) {
        setPasswordPopupOpen(false);
      }

      if (
        editorPopupRef.current &&
        !editorPopupRef.current.contains(event.target)
      ) {
        setEditorPopup((prev) => ({ ...prev, open: false }));
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const openProfile = () => {
    setMenuOpen(false);
    setProfileOpen(true);
    setPasswordPopupOpen(false);
    setPasswordMessage({ type: "", text: "" });
  };

  const openPasswordPopup = () => {
    setPasswordPopupOpen(true);
    setPasswordMessage({ type: "", text: "" });
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordMessage.text) {
      setPasswordMessage({ type: "", text: "" });
    }
  };

  const onChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in current and new password.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    try {
      const response = await handleChangePassword(passwordForm);
      setPasswordMessage({
        type: "success",
        text: response?.message || "Password updated successfully.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setTimeout(() => {
        setPasswordPopupOpen(false);
      }, 1000);
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Password update failed. Please try again.",
      });
    }
  };

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    if (!jobDescription || !selfDescription || !resumeFile) {
      alert("Please fill in all fields and upload your resume.");
      return;
    }

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      navigate(`/interview/${data._id}`);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Interview report generation failed. Please try again.",
      );
    }
  };

  const openEditorPopup = (field) => {
    setEditorPopup({ field, open: true });
  };

  const closeEditorPopup = () => {
    setEditorPopup({ field: "", open: false });
  };

  const isJobEditorOpen = editorPopup.open && editorPopup.field === "jobDescription";
  const editorTitle =
    editorPopup.field === "jobDescription"
      ? "Edit Job Description"
      : "Edit Self Description";

  const editorValue =
    editorPopup.field === "jobDescription" ? jobDescription : selfDescription;

  const handleEditorChange = (event) => {
    const { value } = event.target;

    if (editorPopup.field === "jobDescription") {
      setJobDescription(value);
      return;
    }

    setSelfDescription(value);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Generating your interview report...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <main className="home">
      <section className="home-shell">
        <div className="home-topbar">
          <div className="home-topbar-copy">
            <p className="eyebrow">AI Interview Preparation</p>
            <h1>Build your next interview report</h1>
          </div>

          <button
            type="button"
            className="ranker-link"
            onClick={() => navigate("/resume-ranker")}
          >
            Rank candidate resumes
          </button>

          <div className="user-menu topbar-user-menu" ref={menuRef}>
            <button
              type="button"
              className="user-menu-trigger"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="user-avatar">{userInitials}</span>
              <span className="user-meta">
                <strong>{user?.username || "User"}</strong>
                {/* <small>@{user?.username || "user"}</small> */}
              </span>
            </button>

            {menuOpen ? (
              <div className="user-menu-dropdown">
                <div className="user-menu-actions">
                  <button
                    type="button"
                    className="user-action-btn"
                    onClick={openProfile}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="user-action-btn logout"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="reports-panel">
          <div className="reports-header">
            <h2>Generated Reports</h2>
            <p className="report-subtitle">
              Click any report to continue where you left off.
            </p>
          </div>
          <div className="reports-list">
            {reports?.length > 0 ? (
              reports.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className="report-item"
                  onClick={() => navigate(`/interview/${item._id}`)}
                >
                  <strong>{item.title || `Report ${item._id?.slice(-6)}`}</strong>
                  <span>
                    Score: {item.matchScore ?? "N/A"}% • {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            ) : (
              <p className="empty-reports">No saved reports yet. Generate one to see it here.</p>
            )}
          </div>
        </aside>

        <div className="form-panel">
          <div className="form-header">
            <p className="form-kicker">Candidate Setup</p>
            <h2>Generate Interview Report</h2>
            <p>
              Fill in the details below to create resume-based interview
              questions and preparation insights.
            </p>
          </div>

          <div className="interview-input-group">
            <div className="input-group input-group-lg">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea
                readOnly
                value={jobDescription}
                onClick={() => openEditorPopup("jobDescription")}
                name="jobDescription"
                id="jobDescription"
                placeholder="Paste the role responsibilities, required skills, and expectations here..."
              ></textarea>
            </div>

            <div className="form-grid">
              <div className="input-group upload-group">
                <label htmlFor="resume">Resume</label>
                <label className="file-label" htmlFor="resume">
                  <span>Upload PDF Resume</span>
                  <small>Choose a clean PDF file</small>
                </label>
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf"
                />
              </div>

              <div className="input-group input-group-lg">
                <label htmlFor="selfDescription">Self Description</label>
                <textarea
                  readOnly
                  value={selfDescription}
                  onClick={() => openEditorPopup("selfDescription")}
                  name="selfDescription"
                  id="selfDescription"
                  placeholder="Write a short introduction about your background, strengths, and goals..."
                ></textarea>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="button primary-button generate-btn"
            >
              Generate Interview Report
            </button>
          </div>
        </div>
      </section>

      {profileOpen ? (
        <div className="profile-modal-backdrop">
          <div className="profile-modal" ref={profileRef}>
            <div className="profile-modal-header">
              <div className="profile-modal-user">
                <span className="user-avatar large">{userInitials}</span>
                <div>
                  <h3>{user?.username || "User"}</h3>
                  <p>{user?.email || "No email available"}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProfileOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="profile-details">
              <div className="profile-detail-card">
                <strong>Username</strong>
                <p>{user?.username || "User"}</p>
              </div>
              <div className="profile-detail-card">
                <strong>Email</strong>
                <p>{user?.email || "No email available"}</p>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="user-action-btn"
                onClick={openPasswordPopup}
              >
                Change Password
              </button>
              <button
                type="button"
                className="user-action-btn"
                onClick={() => setProfileOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {passwordPopupOpen ? (
        <div className="profile-modal-backdrop">
          <div className="profile-modal password-popup" ref={passwordPopupRef}>
            <div className="profile-modal-header">
              <div className="profile-section-head">
                <strong>Change Password</strong>
                <p>
                  Enter your current password first, then add a new password.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPasswordPopupOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="change-password-form" onSubmit={onChangePassword}>
              {passwordMessage.text ? (
                <div className={`password-message ${passwordMessage.type}`}>
                  {passwordMessage.text}
                </div>
              ) : null}

              <div className="input-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInput}
                  placeholder="Enter current password"
                />
              </div>

              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInput}
                  placeholder="Enter new password"
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="user-action-btn"
                  onClick={() => setPasswordPopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button primary-button save-password-btn"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editorPopup.open ? (
        <div className="profile-modal-backdrop">
          <div className="profile-modal text-editor-popup" ref={editorPopupRef}>
            <div className="profile-modal-header">
              <div className="profile-section-head">
                <strong>{editorTitle}</strong>
                <p>Write or update your content in the expanded editor.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeEditorPopup}
              >
                Close
              </button>
            </div>

            <div className="input-group text-editor-group">
              <textarea
                autoFocus
                value={editorValue}
                onChange={handleEditorChange}
                className={isJobEditorOpen ? "popup-textarea job-popup" : "popup-textarea self-popup"}
                placeholder={
                  isJobEditorOpen
                    ? "Paste the role responsibilities, required skills, and expectations here..."
                    : "Write a short introduction about your background, strengths, and goals..."
                }
              ></textarea>
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="button primary-button save-password-btn"
                onClick={closeEditorPopup}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default Home;

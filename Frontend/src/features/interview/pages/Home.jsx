import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";

function Home() {
  const { loading, generateReport } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();

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
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const passwordPopupRef = useRef(null);

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
        <div className="hero-panel">
          <p className="eyebrow">AI Interview Preparation</p>
          <h1>Turn your resume into a smarter interview practice space.</h1>
          <p className="hero-copy">
            Paste the role details, upload your resume, and add a short
            introduction.
          </p>

          <div className="hero-points">
            <div className="point-card">
              <span className="point-number">01</span>
              <p>Match candidate experience with the target job description.</p>
            </div>
            <div className="point-card">
              <span className="point-number">02</span>
              <p>
                Create personalized interview questions from resume content.
              </p>
            </div>
            <div className="point-card">
              <span className="point-number">03</span>
              <p>Keep everything in one clean and focused workflow.</p>
            </div>
          </div>
        </div>

        <div className="form-panel">
          <div className="form-header">
            <div className="form-header-top">
              <div>
                <p className="form-kicker">Candidate Setup</p>
                <h2>Generate Interview Report</h2>
                <p>
                  Fill in the details below to create resume-based interview
                  questions and preparation insights.
                </p>
              </div>

              <div className="user-menu" ref={menuRef}>
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
          </div>

          <div className="interview-input-group">
            <div className="input-group input-group-lg">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea
                onChange={(e) => {
                  setJobDescription(e.target.value);
                }}
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
                  onChange={(e) => {
                    setSelfDescription(e.target.value);
                  }}
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
    </main>
  );
}

export default Home;

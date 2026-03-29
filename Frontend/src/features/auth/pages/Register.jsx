import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showPopup("error", "Please fill in username, email, and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showPopup("error", "Please enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      showPopup("error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      await handleRegister({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      showPopup("success", "Account created successfully. Redirecting...");
      navigate("/");
    } catch (err) {
      showPopup(
        "error",
        err?.response?.data?.message ||
          "Registration failed. Please try with valid details."
      );
    }
  };

  if (loading) {
    return (
      <main className="auth-page auth-loading">
        <h1>Loading... </h1>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-hero">
          <p className="auth-kicker">AI Interview Preparation</p>
          <h1>Create your account and start generating smarter interview prep.</h1>
          <p className="auth-copy">
            Join your platform to upload resumes, match job descriptions, and
            get role-specific interview questions in one flow.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight-card">
              <strong>Personalized outputs</strong>
              <p>Use your resume and self-description for relevant questions.</p>
            </div>
            <div className="auth-highlight-card">
              <strong>Fast setup</strong>
              <p>Create an account and start practicing in just a few steps.</p>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-copy">
            <p className="auth-kicker">Register</p>
            <h2>Create your account</h2>
            <p>Set up your profile to start using your AI interview assistant.</p>
          </div>

          {popup.message ? (
            <div className={`auth-popup ${popup.type}`}>{popup.message}</div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (popup.message) showPopup("", "");
                }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (popup.message) showPopup("", "");
                }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (popup.message) showPopup("", "");
                }}
              />
            </div>
            <button className="button primary-button auth-submit-btn">
              Register
            </button>
          </form>

          <p className="auth-switch">
            Already have an Account? <Link to={"/login"}>Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;

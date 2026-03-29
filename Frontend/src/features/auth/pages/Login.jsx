import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showPopup("error", "Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showPopup("error", "Please enter a valid email address.");
      return;
    }

    try {
      await handleLogin({ email: email.trim(), password });
      showPopup("success", "Login successful. Redirecting...");
      navigate("/");
    } catch (err) {
      showPopup(
        "error",
        err?.response?.data?.message || "Login failed. Please check your details."
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
          <h1>Welcome back to your resume-driven interview workspace.</h1>
          <p className="auth-copy">
            Sign in to generate interview questions from your resume and align
            them with your target role in a cleaner, smarter flow.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight-card">
              <strong>Resume-aware practice</strong>
              <p>Generate questions based on real experience and role fit.</p>
            </div>
            <div className="auth-highlight-card">
              <strong>Focused preparation</strong>
              <p>Use one place for role details, self-summary, and output.</p>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-copy">
            <p className="auth-kicker">Login</p>
            <h2>Access your account</h2>
            <p>Enter your credentials to continue building your interview report.</p>
          </div>

          {popup.message ? (
            <div className={`auth-popup ${popup.type}`}>{popup.message}</div>
          ) : null}

          <form onSubmit={handleSubmit}>
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
            <button className="button primary-button auth-submit-btn">Login</button>
          </form>

          <p className="auth-switch">
            Create Account? <Link to={"/register"}>Register</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

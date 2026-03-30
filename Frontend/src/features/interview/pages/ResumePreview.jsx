import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/resume-preview.scss";

function ResumePreview() {
  const { interviewId, resumeId } = useParams();
  const navigate = useNavigate();
  const { getResumePreview, downloadResumeFromHtml, saveResume, fetchSavedResume } =
    useInterview();

  const [resumeHtml, setResumeHtml] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [savingResume, setSavingResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadResume = async () => {
      try {
        setLoadingPreview(true);

        if (resumeId) {
          const savedResume = await fetchSavedResume({ interviewId, resumeId });
          if (!mounted) return;
          setResumeHtml(savedResume.html);
          setResumeTitle(savedResume.title || "");
          return;
        }

        const response = await getResumePreview({ interviewId });
        if (!mounted) return;
        setResumeHtml(response.resumeHtml || "");
        setResumeTitle(response.suggestedTitle || "");
      } catch (error) {
        if (!mounted) return;
        alert(
          error?.response?.data?.message ||
            "Resume preview load failed. Please try again.",
        );
        navigate(`/interview/${interviewId}`);
      } finally {
        if (mounted) {
          setLoadingPreview(false);
        }
      }
    };

    loadResume();

    return () => {
      mounted = false;
    };
  }, [
    fetchSavedResume,
    getResumePreview,
    interviewId,
    navigate,
    resumeId,
  ]);

  const canSave = useMemo(
    () => !resumeId && resumeTitle.trim() && resumeHtml.trim(),
    [resumeHtml, resumeId, resumeTitle],
  );

  const handleDownload = async () => {
    try {
      setDownloadingResume(true);
      await downloadResumeFromHtml({ html: resumeHtml, title: resumeTitle });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Resume download failed. Please try again.",
      );
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || savingResume) {
      return;
    }

    try {
      setSavingResume(true);
      const response = await saveResume({
        interviewId,
        title: resumeTitle.trim(),
        html: resumeHtml,
      });
      navigate(`/interview/${interviewId}`, {
        state: { activeTab: "resumes", savedResumeId: response.savedResume?._id },
      });
    } catch (error) {
      alert(
        error?.response?.data?.message || "Resume save failed. Please try again.",
      );
    } finally {
      setSavingResume(false);
    }
  };

  if (loadingPreview) {
    return (
      <main className="resume-preview-page">
        <section className="resume-preview-shell loading">
          <p>Preparing your resume preview...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="resume-preview-page">
      <section className="resume-preview-shell">
        <div className="resume-preview-topbar">
          <button
            type="button"
            className="resume-back-btn"
            onClick={() => navigate(`/interview/${interviewId}`)}
          >
            Back
          </button>

          <div className="resume-preview-actions">
            {!resumeId ? (
              <input
                type="text"
                className="resume-title-input"
                value={resumeTitle}
                onChange={(event) => setResumeTitle(event.target.value)}
                placeholder="Give this resume a title"
              />
            ) : (
              <div className="saved-title-chip">{resumeTitle}</div>
            )}

            {!resumeId ? (
              <button
                type="button"
                className="resume-action-btn secondary"
                onClick={handleSave}
                disabled={!canSave || savingResume}
              >
                {savingResume ? "Saving..." : "Save Resume"}
              </button>
            ) : null}

            <button
              type="button"
              className="resume-action-btn primary"
              onClick={handleDownload}
              disabled={downloadingResume}
            >
              {downloadingResume ? "Downloading..." : "Download Resume"}
            </button>
          </div>
        </div>

        <div className="resume-preview-frame">
          <iframe
            title="Resume Preview"
            srcDoc={resumeHtml}
            className="resume-preview-iframe"
          />
        </div>
      </section>
    </main>
  );
}

export default ResumePreview;

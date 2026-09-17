import "./loading-state.scss";

export default function LoadingState({
  title = "Getting things ready",
  detail = "This will only take a moment.",
  className = "",
}) {
  return (
    <section className={`loading-state ${className}`.trim()} role="status" aria-live="polite">
      <div className="loading-orbit" aria-hidden="true">
        <span className="loading-orbit-core" />
        <span className="loading-orbit-dot" />
      </div>
      <p className="loading-eyebrow">Please wait</p>
      <h1>{title}</h1>
      <p className="loading-detail">{detail}</p>
      <div className="loading-progress" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

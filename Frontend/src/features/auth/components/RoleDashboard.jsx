import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Home from "../../interview/pages/Home";
import ResumeRanker from "../../resume-ranker/pages/ResumeRanker";

export default function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === "recruiter") return <ResumeRanker />;
  if (user?.role === "student") return <Home />;
  return <Navigate to="/login" replace />;
}

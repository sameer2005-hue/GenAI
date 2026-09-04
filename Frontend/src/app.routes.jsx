import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Landing from "./features/interview/pages/Landing";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import ResumePreview from "./features/interview/pages/ResumePreview";
import ResumeRanker from "./features/resume-ranker/pages/ResumeRanker";
import ResumeDetails from "./features/interview/pages/ResumeDetails";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/app",
    element: <Protected><Home/></Protected>
  },
  {
    path: "/resume-ranker",
    element: <Protected><ResumeRanker/></Protected>
  },
  {
    path: "/interview/:interviewId",
    element: <Protected><Interview/></Protected>
  },
  {
    path: "/interview/:interviewId/resume-details",
    element: <Protected><ResumeDetails/></Protected>
  },
  {
    path: "/interview/:interviewId/resume-preview",
    element: <Protected><ResumePreview/></Protected>
  },
  {
    path: "/interview/:interviewId/resume-preview/:resumeId",
    element: <Protected><ResumePreview/></Protected>
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

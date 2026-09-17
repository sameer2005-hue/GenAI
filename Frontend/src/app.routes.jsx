import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import RoleProtected from "./features/auth/components/RoleProtected";
import RoleDashboard from "./features/auth/components/RoleDashboard";
import Landing from "./features/interview/pages/Landing";
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
    element: <Protected><RoleDashboard/></Protected>
  },
  {
    path: "/resume-ranker",
    element: <RoleProtected allowedRoles={["recruiter"]}><ResumeRanker/></RoleProtected>
  },
  {
    path: "/resume-ranker",
    element: <Protected><ResumeRanker/></Protected>
  },
  {
    path: "/interview/:interviewId",
    element: <RoleProtected allowedRoles={["student"]}><Interview/></RoleProtected>
  },
  {
    path: "/interview/:interviewId/resume-details",
    element: <RoleProtected allowedRoles={["student"]}><ResumeDetails/></RoleProtected>
  },
  {
    path: "/interview/:interviewId/resume-details",
    element: <Protected><ResumeDetails/></Protected>
  },
  {
    path: "/interview/:interviewId/resume-preview",
    element: <RoleProtected allowedRoles={["student"]}><ResumePreview/></RoleProtected>
  },
  {
    path: "/interview/:interviewId/resume-preview/:resumeId",
    element: <RoleProtected allowedRoles={["student"]}><ResumePreview/></RoleProtected>
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

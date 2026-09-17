import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingState from "../../../components/LoadingState";

export default function RoleProtected({ allowedRoles, children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <LoadingState
        title="Preparing your workspace"
        detail="We are checking access for this area."
      />
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/app" replace />;

  return children;
}

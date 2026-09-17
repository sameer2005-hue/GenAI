import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import LoadingState from "../../../components/LoadingState";

function Protected({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <LoadingState
        title="Checking your workspace"
        detail="We are confirming your session before opening the dashboard."
      />
    );
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
}

export default Protected;

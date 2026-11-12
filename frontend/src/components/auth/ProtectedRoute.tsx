import { Navigate, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LoadingState } from "@/components/site/States";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Checking your account..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.href }} replace />;
  }

  return <>{children}</>;
}

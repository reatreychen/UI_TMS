"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { selectAuth, selectRoleName, RoleName } from "@/src/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector(selectAuth);
  const userRole = useAppSelector(selectRoleName);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const isAllowed = allowedRoles.includes(userRole);
      if (!isAllowed) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isInitialized, userRole, allowedRoles, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim font-body-md text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            sync
          </span>
          <p className="text-body-md text-secondary font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}

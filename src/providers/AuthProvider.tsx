"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { checkAuthThunk } from "../store/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  return <>{children}</>;
}

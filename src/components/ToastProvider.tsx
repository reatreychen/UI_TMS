"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#111c2d",
          border: "1px solid #c3c6d7",
          borderRadius: "0.5rem",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
        },
        success: {
          iconTheme: { primary: "#004ac6", secondary: "#ffffff" },
        },
      }}
    />
  );
}

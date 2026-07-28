import React from "react";

export const metadata = {
  title: "Customer Portal | Kinetic Enterprise TMS",
  description: "Customer portal for Kinetic Ticket Management System",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen flex flex-col admin-dashboard">{children}</div>;
}

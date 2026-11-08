"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAppSession } from "@/contexts/app-session-context";

type RequirePersonProps = {
  title: string;
  children: ReactNode;
};

export default function RequirePerson({ title, children }: RequirePersonProps) {
  const { personId, personReady } = useAppSession();

  if (!personReady) {
    return (
      <div className="app-page container-fluid px-3 px-lg-4 py-4">
        <p className="text-secondary mb-0">Loading…</p>
      </div>
    );
  }

  if (!personId) {
    return (
      <div className="app-page container-fluid px-3 px-lg-4 py-4">
        <div className="app-card card border-0 shadow-sm">
          <div className="card-body p-4">
            <h1 className="h5 mb-2">{title}</h1>
            <p className="text-secondary mb-3">
              Choose a person in the navigation bar before using this section.
            </p>
            <Link href="/" className="btn btn-primary btn-sm">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import NavIcon from "@/components/NavIcon";
import { useAppSession } from "@/contexts/app-session-context";

export default function Home() {
  const { personId, personReady } = useAppSession();

  return (
    <div className="container-fluid app-page px-3 px-lg-4 py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="app-card card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="app-home-title mb-2">
                Welcome to Wyxan Small Web
              </h1>
              <p className="app-page-lead mb-4">
                Browse internal sites, search published pages, review history,
                and publish new HTML websites. Select a person in the
                navigation bar to start.
              </p>

              {!personReady && (
                <p className="text-secondary small mb-0">Loading session…</p>
              )}

              {personReady && !personId && (
                <p className="text-secondary small mb-4">
                  No person selected yet. Use the person dropdown in the header.
                </p>
              )}

              {personReady && personId && (
                <p className="text-success small mb-4">
                  A person is selected. Open a section below.
                </p>
              )}

              <div className="d-flex flex-wrap gap-2">
                <Link
                  href="/browser"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                >
                  <NavIcon name="browse" size={15} />
                  Browse
                </Link>
                <Link
                  href="/search"
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                >
                  <NavIcon name="search" size={15} />
                  Search
                </Link>
                <Link
                  href="/history"
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                >
                  <NavIcon name="history" size={15} />
                  History
                </Link>
                <Link
                  href="/publish"
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                >
                  <NavIcon name="publish" size={15} />
                  Publish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

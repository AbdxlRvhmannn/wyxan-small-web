"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import BrowsingHistory from "@/components/BrowsingHistory";
import RequirePerson from "@/components/RequirePerson";
import { useAppSession } from "@/contexts/app-session-context";
import { setPendingNavigation } from "@/lib/pending-navigation";
import type { NavigationActionResponse } from "@/types/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const { personId, historyRefreshKey } = useAppSession();
  const [jumpError, setJumpError] = useState<string | null>(null);

  const handleNavigate = useCallback(
    (response: NavigationActionResponse) => {
      setPendingNavigation(response);
      router.push("/browser");
    },
    [router],
  );

  return (
    <RequirePerson title="History">
      <div className="container-fluid app-page px-3 px-lg-4 py-4">
        <header className="app-page-header">
          <h1 className="app-page-title">Browsing history</h1>
          <p className="app-page-lead">
            Visits for the selected person. Open a page to jump in the browser.
          </p>
        </header>

        {jumpError && (
          <div className="alert alert-danger py-2 mb-3" role="alert">
            {jumpError}
          </div>
        )}

        {personId && (
          <BrowsingHistory
            personId={personId}
            refreshKey={historyRefreshKey}
            scrollY={0}
            layout="table"
            navigationLoading={false}
            onNavigate={handleNavigate}
            onJumpError={(message) =>
              setJumpError(message || "History jump failed")
            }
          />
        )}
      </div>
    </RequirePerson>
  );
}

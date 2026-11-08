"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BrowserToolbar from "@/components/BrowserToolbar";
import RequirePerson from "@/components/RequirePerson";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import { useAppSession } from "@/contexts/app-session-context";
import { consumePendingNavigation } from "@/lib/pending-navigation";
import {
  fetchNavigationCurrent,
  postNavigationBack,
  postNavigationForward,
  postNavigationGo,
} from "@/lib/navigation-api";
import type {
  NavigationActionResponse,
  Website,
} from "@/types/navigation";

export default function BrowserPage() {
  const router = useRouter();
  const { personId, bumpHistoryRefresh } = useAppSession();
  const [currentAddress, setCurrentAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [website, setWebsite] = useState<Website | null>(null);
  const [entryId, setEntryId] = useState("");
  const [restoreScrollY, setRestoreScrollY] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const liveScrollYRef = useRef(0);
  const pendingOpenRef = useRef<string | null>(null);

  const applyActionResponse = useCallback(
    (data: NavigationActionResponse, refreshHistory = false) => {
      if (!data.entryId || !data.website?.address) {
        setWebsite(null);
        setEntryId("");
        setCurrentAddress("");
        setAddressInput("");
        setRestoreScrollY(0);
        setCanGoBack(false);
        setCanGoForward(false);
        return;
      }
      setCurrentAddress(data.address);
      setAddressInput(data.address);
      setWebsite(data.website);
      setEntryId(data.entryId);
      setRestoreScrollY(data.scrollY);
      liveScrollYRef.current = data.scrollY;
      setCanGoBack(data.navigation.canGoBack);
      setCanGoForward(data.navigation.canGoForward);
      if (refreshHistory) {
        bumpHistoryRefresh();
      }
    },
    [bumpHistoryRefresh],
  );

  const loadCurrent = useCallback(async () => {
    if (!personId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pending = consumePendingNavigation();
      if (pending) {
        applyActionResponse(pending, true);
        return;
      }
      const data = await fetchNavigationCurrent(personId);
      if (data.website && data.entryId) {
        applyActionResponse({
          entryId: data.entryId,
          address: data.address,
          website: data.website,
          navigation: data.navigation,
          scrollY: data.scrollY,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore session");
    } finally {
      setLoading(false);
    }
  }, [personId, applyActionResponse]);

  useEffect(() => {
    void loadCurrent();
  }, [loadCurrent]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const open = new URLSearchParams(window.location.search).get("open");
    if (open) {
      pendingOpenRef.current = open;
    }
  }, []);

  const runNavigation = useCallback(
    async (
      action: () => Promise<NavigationActionResponse>,
      refreshHistory = false,
    ) => {
      if (!personId) {
        setError("No person selected.");
        return;
      }
      setLoading(true);
      setError(null);
      setLinkError(null);
      try {
        const data = await action();
        applyActionResponse(data, refreshHistory);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Navigation failed");
      } finally {
        setLoading(false);
      }
    },
    [personId, applyActionResponse],
  );

  const navigate = useCallback(
    (address: string) => {
      const trimmed = address.trim();
      if (!trimmed || !personId) {
        return;
      }
      const scrollY = liveScrollYRef.current;
      void runNavigation(
        () => postNavigationGo(personId, trimmed, scrollY),
        true,
      );
    },
    [personId, runNavigation],
  );

  useEffect(() => {
    const open = pendingOpenRef.current;
    if (!personId || !open) {
      return;
    }
    pendingOpenRef.current = null;
    navigate(open);
    router.replace("/browser");
  }, [personId, navigate, router]);

  const goBack = useCallback(() => {
    if (!personId) {
      return;
    }
    const scrollY = liveScrollYRef.current;
    void runNavigation(() => postNavigationBack(personId, scrollY));
  }, [personId, runNavigation]);

  const goForward = useCallback(() => {
    if (!personId) {
      return;
    }
    const scrollY = liveScrollYRef.current;
    void runNavigation(() => postNavigationForward(personId, scrollY));
  }, [personId, runNavigation]);

  return (
    <RequirePerson title="Browse">
      {personId && (
        <div className="app-browser-layout container-fluid">
          <header className="app-browser-toolbar">
            <header className="app-page-header mb-2">
              <h1 className="app-page-title">Browse</h1>
              <p className="app-page-lead">
                Navigate addresses, use back and forward, and view site content.
              </p>
            </header>
            <BrowserToolbar
              currentAddress={currentAddress}
              addressInput={addressInput}
              onAddressInputChange={setAddressInput}
              onSubmit={() => navigate(addressInput)}
              onBack={goBack}
              onForward={goForward}
              loading={loading}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
            />

            {loading && (
              <div className="d-flex align-items-center gap-2 text-secondary mt-2">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Loading page…</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
                {error}
              </div>
            )}

            {linkError && (
              <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">
                {linkError}
              </div>
            )}
          </header>

          <div className="app-browser-viewport">
            {!loading && (
              <WebsiteRenderer
                website={website}
                entryId={entryId || "empty"}
                restoreScrollY={restoreScrollY}
                onInternalNavigate={navigate}
                onScrollPosition={(scrollY) => {
                  liveScrollYRef.current = scrollY;
                }}
                onInvalidLink={(href) =>
                  setLinkError(`Blocked unsafe or unsupported link: ${href}`)
                }
                framed
              />
            )}
          </div>
        </div>
      )}
    </RequirePerson>
  );
}

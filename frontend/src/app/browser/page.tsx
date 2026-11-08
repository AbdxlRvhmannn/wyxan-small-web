"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import BrowserToolbar from "@/components/BrowserToolbar";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import {
  fetchNavigationCurrent,
  postNavigationBack,
  postNavigationForward,
  postNavigationGo,
} from "@/lib/navigation-api";
import { getSelectedPersonId } from "@/lib/selected-person";
import type {
  NavigationActionResponse,
  Website,
} from "@/types/navigation";

export default function BrowserPage() {
  const [personId, setPersonId] = useState<string | null>(null);
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

  useEffect(() => {
    setPersonId(getSelectedPersonId());
  }, []);

  const applyActionResponse = useCallback((data: NavigationActionResponse) => {
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
  }, []);

  const loadCurrent = useCallback(async () => {
    if (!personId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
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

  const runNavigation = useCallback(
    async (action: () => Promise<NavigationActionResponse>) => {
      if (!personId) {
        setError("No person selected.");
        return;
      }
      setLoading(true);
      setError(null);
      setLinkError(null);
      try {
        const data = await action();
        applyActionResponse(data);
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
      void runNavigation(() =>
        postNavigationGo(personId, trimmed, scrollY),
      );
    },
    [personId, runNavigation],
  );

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

  if (personId === null) {
    return (
      <main className="container py-5" style={{ maxWidth: "640px" }}>
        <p className="text-secondary">Loading…</p>
      </main>
    );
  }

  if (!personId) {
    return (
      <main className="container py-5" style={{ maxWidth: "640px" }}>
        <h1 className="h4 mb-3">Browser</h1>
        <p className="text-secondary mb-3">
          Select a person before using the browser.
        </p>
        <Link href="/" className="btn btn-primary btn-sm">
          Person selector
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-4" style={{ maxWidth: "640px" }}>
      <h1 className="h4 mb-3">Browser</h1>

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
        <div className="d-flex align-items-center gap-2 text-secondary mb-3">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>Loading page…</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}

      {linkError && (
        <div className="alert alert-warning py-2 mb-3" role="alert">
          {linkError}
        </div>
      )}

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
        />
      )}
    </main>
  );
}

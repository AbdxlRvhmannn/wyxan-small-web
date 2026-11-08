"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BrowserToolbar from "@/components/BrowserToolbar";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import { getApiBaseUrl } from "@/lib/api";
import { getSelectedPersonId } from "@/lib/selected-person";
import type { NavigationGoResponse, Website } from "@/types/navigation";

export default function BrowserPage() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [website, setWebsite] = useState<Website | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPersonId(getSelectedPersonId());
  }, []);

  const navigate = useCallback(
    async (address: string) => {
      if (!personId) {
        setError("No person selected.");
        return;
      }

      const trimmed = address.trim();
      if (!trimmed) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/navigation/go`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personId, address: trimmed }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string | string[];
          } | null;
          const message = payload?.message;
          const text = Array.isArray(message)
            ? message.join(", ")
            : message ?? "Navigation failed";
          throw new Error(text);
        }

        const data: NavigationGoResponse = await response.json();
        setCurrentAddress(data.address);
        setAddressInput(data.address);
        setWebsite(data.website);
        setCanGoBack(data.navigation.canGoBack);
        setCanGoForward(data.navigation.canGoForward);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Navigation failed");
      } finally {
        setLoading(false);
      }
    },
    [personId],
  );

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
        onSubmit={() => void navigate(addressInput)}
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

      {!loading && <WebsiteRenderer website={website} />}
    </main>
  );
}

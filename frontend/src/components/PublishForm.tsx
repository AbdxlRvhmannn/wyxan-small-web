"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAppSession } from "@/contexts/app-session-context";
import { getApiBaseUrl } from "@/lib/api";
import { postPublishSite } from "@/lib/sites-api";
import type { PeopleListResponse } from "@/types/person";
import type { PublishSiteResponse } from "@/types/publish";

export default function PublishForm() {
  const router = useRouter();
  const { personId: sessionPersonId, setPersonId } = useAppSession();
  const [people, setPeople] = useState<PeopleListResponse["people"]>([]);
  const [personId, setLocalPersonId] = useState("");
  const [address, setAddress] = useState("");
  const [html, setHtml] = useState("");
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishSiteResponse | null>(null);

  useEffect(() => {
    if (sessionPersonId) {
      setLocalPersonId(sessionPersonId);
    }
  }, [sessionPersonId]);

  useEffect(() => {
    let cancelled = false;
    async function loadPeople() {
      setLoadingPeople(true);
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/people`);
        if (!response.ok) {
          throw new Error("Could not load people");
        }
        const data: PeopleListResponse = await response.json();
        if (!cancelled) {
          setPeople(data.people);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load publishers.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPeople(false);
        }
      }
    }
    void loadPeople();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!personId || !address.trim() || !html.trim()) {
      setError("Publisher, address, and HTML are required.");
      return;
    }
    setPublishing(true);
    setError(null);
    setPublished(null);
    try {
      const result = await postPublishSite({
        personId,
        address: address.trim(),
        html,
      });
      setPublished(result);
      setPersonId(personId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  function openPublished() {
    if (!published) {
      return;
    }
    setPersonId(published.authorId);
    router.push(`/browser?open=${encodeURIComponent(published.address)}`);
  }

  return (
    <div className="container-fluid app-page px-3 px-lg-4 py-4">
      <header className="app-page-header">
        <h1 className="app-page-title">Publish</h1>
        <p className="app-page-lead">
          Submit HTML to create a new site on the small web.
        </p>
      </header>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="app-card p-3 p-md-4"
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="publisher" className="form-label small">
                  Publisher
                </label>
                <select
                  id="publisher"
                  className="form-select form-select-sm"
                  value={personId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLocalPersonId(value);
                    if (value) {
                      setPersonId(value);
                    }
                  }}
                  disabled={loadingPeople || publishing}
                  required
                >
                  <option value="" disabled>
                    Choose publisher…
                  </option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="site-address" className="form-label small">
                  Website address
                </label>
                <input
                  id="site-address"
                  type="text"
                  className="form-control form-control-sm"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="tidepool.zz"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={publishing}
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="site-html" className="form-label small">
                  HTML content
                </label>
                <textarea
                  id="site-html"
                  className="form-control form-control-sm font-monospace"
                  rows={10}
                  value={html}
                  onChange={(event) => setHtml(event.target.value)}
                  disabled={publishing}
                  required
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={publishing || loadingPeople}
                >
                  {publishing ? "Publishing…" : "Publish"}
                </button>
              </div>
            </div>
          </form>

          {publishing && (
            <div className="d-flex align-items-center gap-2 text-secondary mt-3">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              <span>Publishing…</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
              {error}
            </div>
          )}

          {published && (
            <div className="app-card p-3 mt-3">
              <p className="text-success mb-2">Published successfully.</p>
              <p className="mb-1 small">
                <span className="text-secondary">Title:</span> {published.title}
              </p>
              <p className="mb-3 small">
                <span className="text-secondary">Address:</span>{" "}
                {published.address}
              </p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={openPublished}
              >
                Open in browser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

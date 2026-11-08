"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { PeopleListResponse } from "@/types/person";
import { getApiBaseUrl } from "@/lib/api";
import { setSelectedPersonId } from "@/lib/selected-person";

export default function PersonSelector() {
  const router = useRouter();
  const [people, setPeople] = useState<PeopleListResponse["people"]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      setLoading(true);
      setError(null);
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
          setError("Failed to load people. Make sure the backend is running.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPeople();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) {
      return;
    }
    setSelectedPersonId(selectedId);
    setSaved(true);
    router.push("/browser");
  }

  return (
    <main className="container py-5" style={{ maxWidth: "480px" }}>
      <h1 className="h4 mb-4">Select a person</h1>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-secondary">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>Loading people…</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger py-2 mb-0" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="person-select" className="form-label">
              Person
            </label>
            <select
              id="person-select"
              className="form-select"
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setSaved(false);
              }}
              required
            >
              <option value="" disabled>
                Choose…
              </option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {people.length === 0 && (
            <p className="text-secondary small mb-3">No people found.</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedId || people.length === 0}
          >
            Enter Browser
          </button>

          {saved && (
            <p className="text-success small mt-3 mb-0">
              Selection saved for navigation.
            </p>
          )}
        </form>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import NavIcon from "@/components/NavIcon";
import { useAppSession } from "@/contexts/app-session-context";
import { getApiBaseUrl } from "@/lib/api";
import type { PeopleListResponse } from "@/types/person";

export default function NavPersonSelect() {
  const { personId, setPersonId } = useAppSession();
  const [people, setPeople] = useState<PeopleListResponse["people"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/people`);
        if (!response.ok) {
          throw new Error("load failed");
        }
        const data: PeopleListResponse = await response.json();
        if (!cancelled) {
          setPeople(data.people);
        }
      } catch {
        if (!cancelled) {
          setError(true);
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

  if (loading) {
    return (
      <span className="app-nav-person app-nav-status">Loading…</span>
    );
  }

  if (error) {
    return (
      <span className="app-nav-person app-nav-status app-nav-status-error">
        People unavailable
      </span>
    );
  }

  return (
    <div className="app-nav-person d-flex align-items-center gap-2">
      <NavIcon name="person" size={16} />
      <label htmlFor="nav-person" className="app-nav-person-label">
        Person
      </label>
      <select
        id="nav-person"
        className="form-select form-select-sm app-nav-select"
        value={personId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          if (value) {
            setPersonId(value);
          }
        }}
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
  );
}

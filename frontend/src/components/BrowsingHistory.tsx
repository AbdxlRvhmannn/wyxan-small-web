"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBrowsingHistory, postHistoryJump } from "@/lib/history-api";
import type { HistoryVisit } from "@/types/history";
import type { NavigationActionResponse } from "@/types/navigation";

type BrowsingHistoryProps = {
  personId: string;
  refreshKey: number;
  scrollY: number;
  onNavigate: (response: NavigationActionResponse) => void;
  onJumpError: (message: string) => void;
  navigationLoading: boolean;
  layout?: "list" | "table";
};

const PAGE_SIZE = 15;

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

function navigationLabel(type: HistoryVisit["navigationType"]): string {
  return type === "jump" ? "History" : "Navigate";
}

export default function BrowsingHistory({
  personId,
  refreshKey,
  scrollY,
  onNavigate,
  onJumpError,
  navigationLoading,
  layout = "list",
}: BrowsingHistoryProps) {
  const [visits, setVisits] = useState<HistoryVisit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [jumpingVisitId, setJumpingVisitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (cursor?: string, append = false) => {
      if (!personId) {
        return;
      }
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await fetchBrowsingHistory(personId, PAGE_SIZE, cursor);
        setTotalCount(data.totalCount);
        setNextCursor(data.nextCursor);
        setVisits((current) =>
          append ? [...current, ...data.visits] : data.visits,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
        if (!append) {
          setVisits([]);
          setTotalCount(0);
          setNextCursor(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [personId],
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage, personId, refreshKey]);

  async function handleJump(visitId: string) {
    setJumpingVisitId(visitId);
    try {
      const response = await postHistoryJump(personId, visitId, scrollY);
      onNavigate(response);
    } catch (err) {
      onJumpError(err instanceof Error ? err.message : "History jump failed");
    } finally {
      setJumpingVisitId(null);
    }
  }

  const tableLayout = layout === "table";

  return (
    <section className="app-card" aria-label="Browsing history">
      {tableLayout && (
        <div className="border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
          <span className="small text-secondary">
            {totalCount} visit{totalCount === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {!tableLayout && (
        <div className="border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
          <h2 className="h6 mb-0">Browsing history</h2>
          <span className="small text-secondary">{totalCount} visits</span>
        </div>
      )}

      {loading && (
        <div className="p-3 d-flex align-items-center gap-2 text-secondary">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>Loading history…</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger py-2 m-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && visits.length === 0 && (
        <p className="text-secondary p-3 mb-0">No browsing history yet.</p>
      )}

      {!loading && visits.length > 0 && tableLayout && (
        <div className="app-table-wrap">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th scope="col">Title</th>
                <th scope="col" className="d-none d-md-table-cell">
                  Address
                </th>
                <th scope="col" className="d-none d-lg-table-cell">
                  Visited
                </th>
                <th scope="col" className="d-none d-xl-table-cell">
                  Type
                </th>
                <th scope="col" className="text-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.visitId}>
                  <td>
                    <div className="fw-semibold">{visit.title}</div>
                    <div className="small text-secondary d-md-none">
                      {visit.address}
                    </div>
                  </td>
                  <td className="small text-secondary d-none d-md-table-cell">
                    {visit.address}
                  </td>
                  <td className="small text-secondary d-none d-lg-table-cell">
                    {formatTimestamp(visit.visitedAt)}
                  </td>
                  <td className="small d-none d-xl-table-cell">
                    {navigationLabel(visit.navigationType)}
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      disabled={
                        navigationLoading || jumpingVisitId !== null
                      }
                      onClick={() => void handleJump(visit.visitId)}
                    >
                      {jumpingVisitId === visit.visitId ? "…" : "Open"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && visits.length > 0 && !tableLayout && (
        <ul className="list-group list-group-flush">
          {visits.map((visit) => (
            <li
              key={visit.visitId}
              className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
            >
              <div>
                <div className="fw-semibold">{visit.title}</div>
                <div className="small text-secondary">{visit.address}</div>
                <div className="small text-secondary">
                  {formatTimestamp(visit.visitedAt)} ·{" "}
                  {navigationLabel(visit.navigationType)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                disabled={
                  navigationLoading || jumpingVisitId !== null
                }
                onClick={() => void handleJump(visit.visitId)}
              >
                {jumpingVisitId === visit.visitId ? "…" : "Open"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {nextCursor && !loading && (
        <div className="p-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={loadingMore}
            onClick={() => void loadPage(nextCursor, true)}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

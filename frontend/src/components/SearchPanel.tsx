"use client";

import { FormEvent, useState } from "react";
import { fetchSearch } from "@/lib/search-api";
import type { SearchResponse, SearchResultItem } from "@/types/search";

type SearchPanelProps = {
  minimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
  onOpenResult: (address: string) => void;
  navigationLoading: boolean;
};

export default function SearchPanel({
  minimized,
  onMinimize,
  onRestore,
  onOpenResult,
  navigationLoading,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function runSearch(searchQuery: string) {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    setActiveQuery(trimmed);
    try {
      const data: SearchResponse = await fetchSearch(trimmed);
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setResults([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  if (minimized) {
    return (
      <section className="border rounded bg-white mt-4 p-3" aria-label="Search">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span className="small text-secondary">
            Search: <span className="text-body">{activeQuery || "—"}</span>
            {searched ? ` · ${total} result${total === 1 ? "" : "s"}` : ""}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onRestore}
          >
            Back to search results
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="border rounded bg-white mt-4" aria-label="Search">
      <div className="border-bottom px-3 py-2">
        <h2 className="h6 mb-0">Search</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-bottom row g-2">
        <div className="col">
          <label htmlFor="search-query" className="visually-hidden">
            Search query
          </label>
          <input
            id="search-query"
            type="search"
            className="form-control form-control-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all websites"
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <div className="col-auto">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !query.trim()}
          >
            {loading ? "…" : "Search"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="p-3 d-flex align-items-center gap-2 text-secondary">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>Searching…</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger py-2 m-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <p className="text-secondary p-3 mb-0">No results for “{activeQuery}”.</p>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="small text-secondary px-3 pt-3 mb-2">
            {total} result{total === 1 ? "" : "s"} for “{activeQuery}”
          </p>
          <ul className="list-group list-group-flush">
            {results.map((result) => (
              <li
                key={result.siteId}
                className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2"
              >
                <div>
                  <div className="fw-semibold">{result.title}</div>
                  <div className="small text-secondary">{result.address}</div>
                  {result.excerpt && (
                    <div className="small mt-1">{result.excerpt}</div>
                  )}
                  <div className="small text-secondary">
                    Score: {result.score.toFixed(2)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={navigationLoading}
                  onClick={() => {
                    onMinimize();
                    onOpenResult(result.address);
                  }}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

"use client";

import { FormEvent } from "react";

type BrowserToolbarProps = {
  currentAddress: string;
  addressInput: string;
  onAddressInputChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onForward: () => void;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
};

export default function BrowserToolbar({
  currentAddress,
  addressInput,
  onAddressInputChange,
  onSubmit,
  onBack,
  onForward,
  loading,
  canGoBack,
  canGoForward,
}: BrowserToolbarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="app-card p-3 bg-white">
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={loading || !canGoBack}
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={loading || !canGoForward}
          onClick={onForward}
        >
          Forward
        </button>
      </div>

      <p className="small text-secondary mb-2">
        Current address:{" "}
        <span className="text-body">{currentAddress || "—"}</span>
      </p>

      <form onSubmit={handleSubmit} className="row g-2 align-items-center">
        <div className="col">
          <label htmlFor="address-input" className="visually-hidden">
            Address
          </label>
          <input
            id="address-input"
            type="text"
            className="form-control form-control-sm"
            value={addressInput}
            onChange={(event) => onAddressInputChange(event.target.value)}
            placeholder="wyxan://home"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
        </div>
        <div className="col-auto">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !addressInput.trim()}
          >
            {loading ? "…" : "Go"}
          </button>
        </div>
      </form>
    </div>
  );
}

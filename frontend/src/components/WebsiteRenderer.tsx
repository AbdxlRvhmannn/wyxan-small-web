"use client";

import { useMemo } from "react";
import type { Website } from "@/types/navigation";
import {
  buildPublisherSrcDoc,
  sanitizePublisherHtml,
} from "@/lib/sanitize-publisher-html";

type WebsiteRendererProps = {
  website: Website | null;
};

export default function WebsiteRenderer({ website }: WebsiteRendererProps) {
  const srcDoc = useMemo(() => {
    if (!website || !website.html.trim()) {
      return undefined;
    }
    const sanitized = sanitizePublisherHtml(website.html);
    if (!sanitized.trim()) {
      return buildPublisherSrcDoc("<p>No displayable content after sanitization.</p>");
    }
    return buildPublisherSrcDoc(sanitized);
  }, [website]);

  if (!website) {
    return (
      <section
        className="border rounded p-3 bg-white text-secondary"
        aria-label="Website content"
      >
        No page loaded.
      </section>
    );
  }

  const htmlMissing = !website.html.trim();

  return (
    <section
      className="border rounded bg-white overflow-hidden"
      aria-label="Website content"
    >
      <div className="border-bottom px-3 py-2 bg-white">
        <h2 className="h6 mb-1">{website.title}</h2>
        <p className="small text-secondary mb-0">{website.address}</p>
      </div>

      {htmlMissing ? (
        <div className="p-3 text-secondary">This page has no HTML content.</div>
      ) : (
        <iframe
          key={`${website.address}-${srcDoc?.length ?? 0}`}
          title={website.title}
          sandbox=""
          srcDoc={srcDoc}
          className="w-100 border-0"
          style={{ minHeight: "320px", display: "block" }}
        />
      )}
    </section>
  );
}

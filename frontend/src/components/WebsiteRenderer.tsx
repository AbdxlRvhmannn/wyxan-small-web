"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Website } from "@/types/navigation";
import {
  IFRAME_NAVIGATE_MESSAGE_TYPE,
  IFRAME_SCROLL_MESSAGE_TYPE,
  IFRAME_SET_SCROLL_MESSAGE_TYPE,
} from "@/lib/iframe-link-bridge";
import {
  buildPublisherSrcDoc,
  sanitizePublisherHtml,
} from "@/lib/sanitize-publisher-html";
import { parseNavigationDestination } from "@/lib/validate-navigation-destination";

type WebsiteRendererProps = {
  website: Website | null;
  entryId: string;
  restoreScrollY: number;
  onInternalNavigate: (address: string) => void;
  onInvalidLink?: (href: string) => void;
  onScrollPosition?: (scrollY: number) => void;
};

export default function WebsiteRenderer({
  website,
  entryId,
  restoreScrollY,
  onInternalNavigate,
  onInvalidLink,
  onScrollPosition,
}: WebsiteRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = useMemo(() => {
    if (!website || !website.html.trim()) {
      return undefined;
    }
    const sanitized = sanitizePublisherHtml(website.html);
    const scriptNonce =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `n-${entryId}`;
    if (!sanitized.trim()) {
      return buildPublisherSrcDoc(
        "<p>No displayable content after sanitization.</p>",
        scriptNonce,
      );
    }
    return buildPublisherSrcDoc(sanitized, scriptNonce);
  }, [website, entryId]);

  useEffect(() => {
    if (!srcDoc) {
      return;
    }

    function handleMessage(event: MessageEvent) {
      const contentWindow = iframeRef.current?.contentWindow;
      if (!contentWindow || event.source !== contentWindow) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }

      if (data.type === IFRAME_SCROLL_MESSAGE_TYPE && typeof data.scrollY === "number") {
        onScrollPosition?.(data.scrollY);
        return;
      }

      if (
        data.type !== IFRAME_NAVIGATE_MESSAGE_TYPE ||
        typeof data.href !== "string"
      ) {
        return;
      }

      const address = parseNavigationDestination(data.href);
      if (!address) {
        onInvalidLink?.(data.href);
        return;
      }

      onInternalNavigate(address);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [srcDoc, onInternalNavigate, onInvalidLink, onScrollPosition]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const contentWindow = iframe?.contentWindow;
    if (!iframe || !contentWindow || !srcDoc) {
      return;
    }

    function sendScroll() {
      const win = iframeRef.current?.contentWindow;
      if (!win) {
        return;
      }
      win.postMessage(
        { type: IFRAME_SET_SCROLL_MESSAGE_TYPE, scrollY: restoreScrollY },
        "*",
      );
    }

    iframe.addEventListener("load", sendScroll);
    sendScroll();
    return () => iframe.removeEventListener("load", sendScroll);
  }, [entryId, restoreScrollY, srcDoc]);

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
          ref={iframeRef}
          key={entryId}
          title={website.title}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="w-100 border-0"
          style={{ minHeight: "320px", display: "block" }}
        />
      )}
    </section>
  );
}

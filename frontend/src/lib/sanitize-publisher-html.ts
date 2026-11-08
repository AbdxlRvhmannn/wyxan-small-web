import DOMPurify from "dompurify";
import { getIframeLinkBridgeScript } from "./iframe-link-bridge";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "br",
  "div",
  "span",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
];

const ALLOWED_ATTR = ["href", "title", "class"];

const FORBID_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "svg",
  "math",
];

const BLOCKED_URI_PATTERN =
  /^(?:\s*)(?:javascript:|vbscript:|data:(?!image\/(?:png|gif|jpeg|jpg|webp);base64,))/i;

let hooksRegistered = false;

function registerHooks() {
  if (hooksRegistered || typeof window === "undefined") {
    return;
  }
  hooksRegistered = true;

  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    if (data.attrName === "href" || data.attrName === "src" || data.attrName === "xlink:href") {
      const value = data.attrValue.trim();
      if (BLOCKED_URI_PATTERN.test(value)) {
        data.attrValue = "";
        return;
      }
      if (/^(https?:|\/\/)/i.test(value)) {
        data.attrValue = "";
        return;
      }
    }
    if (data.attrName.startsWith("on")) {
      data.attrValue = "";
    }
  });
}

export function sanitizePublisherHtml(html: string): string {
  registerHooks();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS,
    FORBID_ATTR: ["style"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ADD_URI_SAFE_ATTR: [],
  });
}

export function buildPublisherSrcDoc(
  sanitizedBodyHtml: string,
  scriptNonce: string,
): string {
  const csp = `default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; media-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; script-src 'nonce-${scriptNonce}'; base-uri 'none'; form-action 'none'; manifest-src 'none';`;
  const bridge = getIframeLinkBridgeScript();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>Published page</title>
</head>
<body>${sanitizedBodyHtml}
<script nonce="${scriptNonce}">${bridge}</script>
</body>
</html>`;
}

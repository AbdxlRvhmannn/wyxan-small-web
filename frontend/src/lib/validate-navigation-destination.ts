const BLOCKED_SCHEME =
  /^\s*(javascript|data|file|vbscript|blob|about|chrome|chrome-extension):/i;

const EXTERNAL_SCHEME = /^\s*(https?|ftp|mailto|tel|sms):/i;

const PROTOCOL_RELATIVE = /^\s*\/\//;

export function parseNavigationDestination(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }
  if (BLOCKED_SCHEME.test(trimmed) || EXTERNAL_SCHEME.test(trimmed)) {
    return null;
  }
  if (PROTOCOL_RELATIVE.test(trimmed)) {
    return null;
  }
  if (/^wyxan:\/\//i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return null;
}

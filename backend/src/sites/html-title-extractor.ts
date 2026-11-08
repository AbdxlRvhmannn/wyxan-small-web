import { parse } from 'node-html-parser';

export function extractSiteTitle(html: string, fallbackAddress: string): string {
  const root = parse(html, { blockTextElements: { script: false, style: false } });
  const titleTag = root.querySelector('title')?.text.replace(/\s+/g, ' ').trim();
  if (titleTag) {
    return titleTag.slice(0, 200);
  }
  const h1 = root.querySelector('h1')?.text.replace(/\s+/g, ' ').trim();
  if (h1) {
    return h1.slice(0, 200);
  }
  return fallbackAddress;
}

import { convert } from 'html-to-text';

export function extractSearchText(html: string): string {
  const text = convert(html, {
    selectors: [
      { selector: 'script', format: 'skip' },
      { selector: 'style', format: 'skip' },
      { selector: 'noscript', format: 'skip' },
    ],
    wordwrap: false,
    preserveNewlines: false,
  });
  return text.replace(/\s+/g, ' ').trim();
}

import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'em',
  'b',
  'i',
  'br',
  'div',
  'span',
  'blockquote',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'title',
];

const BLOCKED_SCHEME = /^(?:javascript|data|vbscript|file|blob):/i;

export function sanitizePublishedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'class'],
      '*': ['class'],
    },
    allowVulnerableTags: false,
    disallowedTagsMode: 'discard',
    allowedSchemes: ['wyxan'],
    allowedSchemesByTag: {
      a: ['wyxan'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href?.trim() ?? '';
        if (
          !href ||
          BLOCKED_SCHEME.test(href) ||
          /^(https?:|\/\/)/i.test(href)
        ) {
          const nextAttribs = { ...attribs };
          delete nextAttribs.href;
          return { tagName, attribs: nextAttribs };
        }
        return { tagName, attribs };
      },
    },
  });
}

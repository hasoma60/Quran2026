/**
 * Lightweight HTML sanitizer to prevent XSS attacks.
 * Strips all script tags, event handlers, and dangerous attributes
 * while preserving safe formatting tags.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'em', 'strong', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'sup', 'sub', 'mark', 'small',
]);

const ALLOWED_ATTRS = new Set([
  'class', 'id', 'dir', 'lang', 'href', 'title', 'target',
]);

const DANGEROUS_ATTR_PATTERN = /^on/i;
const DANGEROUS_PROTO_PATTERN = /^(javascript|data|vbscript):/i;

export function sanitizeHTML(html: string): string {
  if (!html) return '';

  // Create a DOM parser to parse the HTML safely
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function sanitizeNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();

    // Remove disallowed tags entirely (script, iframe, object, embed, etc.)
    if (!ALLOWED_TAGS.has(tagName)) {
      // But keep the text content of non-dangerous inline elements
      const fragment = document.createDocumentFragment();
      el.childNodes.forEach(child => {
        const sanitized = sanitizeNode(child);
        if (sanitized) fragment.appendChild(sanitized);
      });
      return fragment;
    }

    // Create clean element
    const cleanEl = document.createElement(tagName);

    // Copy only allowed attributes
    for (const attr of Array.from(el.attributes)) {
      const attrName = attr.name.toLowerCase();

      // Skip event handlers (onclick, onload, etc.)
      if (DANGEROUS_ATTR_PATTERN.test(attrName)) continue;

      // Skip non-allowed attributes
      if (!ALLOWED_ATTRS.has(attrName)) continue;

      // Sanitize href values
      if (attrName === 'href' && DANGEROUS_PROTO_PATTERN.test(attr.value.trim())) {
        continue;
      }

      cleanEl.setAttribute(attrName, attr.value);
    }

    // Force target="_blank" and rel="noopener" on links
    if (tagName === 'a') {
      cleanEl.setAttribute('target', '_blank');
      cleanEl.setAttribute('rel', 'noopener noreferrer');
    }

    // Recursively sanitize children
    el.childNodes.forEach(child => {
      const sanitized = sanitizeNode(child);
      if (sanitized) cleanEl.appendChild(sanitized);
    });

    return cleanEl;
  }

  const fragment = document.createDocumentFragment();
  doc.body.childNodes.forEach(child => {
    const sanitized = sanitizeNode(child);
    if (sanitized) fragment.appendChild(sanitized);
  });

  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHTML(html: string): string {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

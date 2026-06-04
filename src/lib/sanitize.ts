/**
 * Escapes HTML special characters to prevent XSS when embedding
 * user-submitted values into email HTML templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Basic email format validation.
 * Rejects obviously malformed addresses to prevent bad Resend calls
 * and invalid database entries.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

/**
 * Serializes data for safe embedding inside a <script type="application/ld+json">
 * rendered via dangerouslySetInnerHTML. JSON.stringify alone does NOT escape
 * "</script>", so CMS- or user-controlled content (e.g. FAQ answers from the CMS)
 * could otherwise break out of the script element and execute (stored XSS).
 * Escaping <, > and & neutralizes the closing-tag and entity vectors while
 * remaining valid JSON-LD.
 */
export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

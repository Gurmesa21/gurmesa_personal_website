/**
 * Canonical reading-time calculation for blog articles across listing and detail views.
 * Strips markdown, HTML, code blocks, and counts visible words at 200 WPM (min 1 min).
 */

export function stripMarkup(content: string): string {
  if (!content) return '';

  return (
    content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]*`/g, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove images: ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      // Replace links [text](url) with just text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Remove blockquotes, headings, list markers
      .replace(/^[>#*\-+]\s+/gm, '')
      // Remove bold/italic markers
      .replace(/[*_~]{1,3}/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function countWords(content: string): number {
  const plainText = stripMarkup(content);
  if (!plainText) return 0;
  // Match word sequences (supports Latin, Ethiopic, and unicode word chars)
  const words = plainText.match(/[\w\u00C0-\u024F\u1200-\u137F'-]+/g);
  return words ? words.length : 0;
}

export function calculateReadingTimeMinutes(content: string, wordsPerMinute = 200): number {
  const words = countWords(content);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function formatReadingTime(content: string, wordsPerMinute = 200): string {
  const minutes = calculateReadingTimeMinutes(content, wordsPerMinute);
  return `${minutes} min read`;
}

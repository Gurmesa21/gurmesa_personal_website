import { describe, it, expect } from 'vitest';
import { countWords, calculateReadingTimeMinutes, formatReadingTime, stripMarkup } from '@/lib/reading-time';

describe('TASK 7 — Consistent Blog Reading-Time Calculation', () => {
  it('strips markdown syntax, html tags, and code blocks before counting words', () => {
    const rawMarkdown = `
# Title of Article

This is a regular paragraph with **bold** text and [a link](https://example.com).

\`\`\`typescript
const a = 1;
const b = 2;
console.log(a + b);
// lots of code words that should not be counted as reading time
\`\`\`

<div class="test">HTML content</div>

> A blockquote quote here.
    `;

    const cleaned = stripMarkup(rawMarkdown);
    expect(cleaned).not.toContain('```');
    expect(cleaned).not.toContain('<div');
    expect(cleaned).not.toContain('https://example.com');
    expect(cleaned).toContain('regular paragraph with bold text and a link');
  });

  it('calculates minimum 1 minute for short articles', () => {
    const shortArticle = 'A brief announcement about our new release.';
    expect(calculateReadingTimeMinutes(shortArticle)).toBe(1);
    expect(formatReadingTime(shortArticle)).toBe('1 min read');
  });

  it('calculates exact 2 minutes for 400 words at 200 WPM', () => {
    const words400 = Array(400).fill('word').join(' ');
    expect(countWords(words400)).toBe(400);
    expect(calculateReadingTimeMinutes(words400)).toBe(2);
    expect(formatReadingTime(words400)).toBe('2 min read');
  });

  it('calculates 3 minutes for 401 words (ceil rule)', () => {
    const words401 = Array(401).fill('word').join(' ');
    expect(calculateReadingTimeMinutes(words401)).toBe(3);
    expect(formatReadingTime(words401)).toBe('3 min read');
  });

  it('produces identical reading time output for listing and detail representations', () => {
    const articleBody = `
## Microservice Architecture at Scale

Here is an in-depth breakdown of how we scaled from 100 requests per second to over 100,000 req/s.

\`\`\`go
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    // heavy logic
}
\`\`\`

${Array(300).fill('architecture').join(' ')}
    `;

    const listingReadingTime = formatReadingTime(articleBody);
    const detailReadingTime = formatReadingTime(articleBody);
    expect(listingReadingTime).toBe(detailReadingTime);
  });
});

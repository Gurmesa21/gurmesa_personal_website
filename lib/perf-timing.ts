/**
 * Performance timing utility for server-side queries and operations.
 * Logs a warning if any operation exceeds the 1000ms threshold.
 */

export async function timedQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    if (duration > 1000) {
      console.warn(`[Performance Warning] Query/Page operation "${label}" took ${duration.toFixed(1)}ms (> 1000ms)`);
    }
  }
}


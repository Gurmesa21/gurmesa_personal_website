# Re-render & Refresh Audit (Task 2, Step 2.1)

Audit conducted across `app/`, `components/`, `lib/`, `proxy.ts`, `next.config.ts`.

---

## Findings by Category (a - m)

### a. `TabVisibilityRefresher` and `router.refresh()` Calls
- **File & Line**: `components/utils/TabVisibilityRefresher.tsx:16`
- **File & Line**: `app/[locale]/(public)/layout.tsx:4, 13`
- **Status**: **CONFIRMED PRIMARY CAUSE**.
- **Evidence**:
  ```tsx
  // components/utils/TabVisibilityRefresher.tsx
  window.addEventListener('focus', handleRefresh);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  ...
  router.refresh();
  ```
  Whenever a user clicks outside the browser window and returns, switches tabs, or changes window focus, `router.refresh()` is invoked. In Next.js App Router, `router.refresh()` triggers a full RSC (React Server Component) payload re-fetch for the active route tree, tearing down and reconstructing components, reloading `<video>` streams, and resetting animation states.

### b. Event Listeners (`visibilitychange`, `focus`, `blur`, `pageshow`, `online`, `resize`, `scroll`)
- **`components/utils/TabVisibilityRefresher.tsx:26-27`**: Attaches `focus` and `visibilitychange` listeners that trigger `router.refresh()`.
- **`components/layout/header.tsx:35`**: Attaches `mousedown` listener to close mobile menu / language picker on click-outside. (Safe, local state only).
- **`components/blog/BlogPostClientView.tsx:139`**: Attaches `hashchange` listener to switch between article and comments view. (Safe, local state only).
- **Status**: Only `TabVisibilityRefresher.tsx` triggers server refreshes.

### c. Auth.js `SessionProvider` or `useSession` in Public Layouts
- **Status**: **NOT PRESENT**.
- **Evidence**: Neither `SessionProvider` nor `useSession` is imported or mounted in `app/[locale]/(public)/layout.tsx` or any public pages. Authentication is handled server-side in `proxy.ts` and `/admin` routes.

### d. Data-Fetching Libraries with Focus / Reconnect Refetching
- **Status**: **NOT PRESENT**.
- **Evidence**: SWR and TanStack React Query are not installed in `package.json`. No `revalidateOnFocus` or `refetchOnWindowFocus` options exist.

### e. Notification Polling or Fetch Timers on Public Pages
- **Status**: **NOT PRESENT**.
- **Evidence**: No `setInterval` calls exist in public components. One-shot `setTimeout` is only used for temporary "Copied to clipboard" button feedback (2 seconds) in `BlogInteractionButtons.tsx:88` and `BlogPostClientView.tsx:204`.

### f. Breakpoint-based Tree Branching in JS (`innerWidth`, `matchMedia`)
- **Status**: **CLEAN**.
- **Evidence**: No JS hooks like `useWindowSize` or `useMediaQuery` exist. All responsive layout branching is handled purely with CSS / Tailwind responsive utility classes (`hidden md:block`, `grid-cols-1 md:grid-cols-2`), ensuring zero unmounting/remounting on window resize.

### g. Unstable React `key` Props
- **Status**: **CLEAN**.
- **Evidence**: No `Math.random()`, `Date.now()`, or ephemeral object references are used as keys. All mapped items use persistent database IDs (`service.id`, `project.id`, `post.id`, `comment.id`).

### h. Hydration Mismatches
- **File & Line**: `components/blog/BlogPostClientView.tsx:91`
- **Evidence**: `useState(() => typeof window !== 'undefined' && window.location.hash === '#comments' ? 'comments' : 'article')`.
- **Action**: Initialize state as `'article'` and sync `#comments` hash inside `useEffect` (client-side only) to guarantee zero SSR hydration mismatch.

### i. `<Link prefetch>` or Effects with `router.push` / `router.replace`
- **File & Line**: `components/layout/header.tsx:40` (`router.replace` for user-initiated locale switch).
- **File & Line**: `components/blog/BlogSearch.tsx:31` (`router.push` for search queries).
- **File & Line**: `components/blog/BlogInteractionButtons.tsx:95` (`router.push` for jump-to-comments button).
- **Status**: None of these fire automatically on focus, tab switch, or window blur.

### j. Dynamic Rendering Flags on Public Routes
- **File & Line**: `app/[locale]/(public)/*/page.tsx` had `export const revalidate = 60`.
- **Action**: Per Step 2.2, public routes should use `export const revalidate = 3600` (static ISR) with on-demand cache invalidation via `revalidatePath` / `revalidatePublicContent`, eliminating unintended server re-renders while keeping `if (isTestMode()) noStore()` for test isolation.

### k. Service Workers / `<meta http-equiv="refresh">` / `location.reload()`
- **Status**: **NOT PRESENT**. No service workers or reload scripts found.

### l. Media Components & `<video>` Element Stability
- **Status**: `<video>` elements in `page.tsx`, `work/page.tsx`, `services/page.tsx`, `blog/page.tsx`, and `MediaRenderer.tsx` remounted whenever `router.refresh()` rebuilt the DOM tree.
- **Action**: Removing `TabVisibilityRefresher` and assigning stable keys prevents media tearing or stream resets on focus/blur.

### m. Framer-Motion / Animation Replay
- **Status**: **NOT PRESENT**. No `framer-motion` or `AnimatePresence` libraries installed.

---

## Action Plan for Step 2.2
1. Remove `TabVisibilityRefresher` import and element from `app/[locale]/(public)/layout.tsx`.
2. Delete `components/utils/TabVisibilityRefresher.tsx`.
3. Set `export const revalidate = 3600` across all public pages in `app/[locale]/(public)/`.
4. Fix the hydration edge case in `components/blog/BlogPostClientView.tsx:91`.
5. Ensure stable keys and playback state on background media elements.


# نور القرآن (Noor Quran) — App Review & Recommendations

> Comprehensive code review, improvement areas, and feature proposals
> Review Date: January 2026 | Version Reviewed: 1.3.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Security Issues](#1-security-issues)
3. [Architecture & Code Quality](#2-architecture--code-quality)
4. [Performance Issues](#3-performance-issues)
5. [UX / Usability Issues](#4-ux--usability-issues)
6. [Accessibility (a11y)](#5-accessibility-a11y)
7. [Missing Infrastructure](#6-missing-infrastructure)
8. [Proposed Features](#7-proposed-features)
9. [Priority Matrix](#8-priority-matrix)

---

## Executive Summary

نور القرآن is a well-designed Arabic Quran reading app with Gemini AI integration, targeting Samsung Galaxy S25 Ultra. It provides core reading functionality (114 chapters, Uthmanic text, 4 tafsir sources, audio recitation, search, bookmarks) with a clean RTL interface.

The app has a solid foundation but presents **critical security vulnerabilities**, **architectural scalability concerns**, and significant opportunities for new features that would elevate it from a basic reader to a comprehensive Quran study platform.

**Total issues found: 34 | Feature proposals: 20**

---

## 1. Security Issues

### CRITICAL — XSS via `dangerouslySetInnerHTML`

| Severity | File | Line |
|----------|------|------|
| **Critical** | `components/ChapterList.tsx` | 133 |
| **Critical** | `components/QuranReader.tsx` | 288-291 |

**Problem:** The app renders API response HTML directly into the DOM without sanitization:

```tsx
// ChapterList.tsx:133 — Search results
<p dangerouslySetInnerHTML={{ __html: result.text }}></p>

// QuranReader.tsx:288-291 — Tafsir content
<div dangerouslySetInnerHTML={{ __html: tafsirContent }} />
```

If the Quran.com API is ever compromised or returns malicious content, this enables arbitrary JavaScript execution in the user's browser (stored XSS).

**Fix:** Use a sanitization library like `DOMPurify` before rendering:

```tsx
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tafsirContent) }} />
```

### HIGH — No Content Security Policy (CSP)

The `index.html` has no CSP meta tag. Combined with the XSS vectors above, this means injected scripts can freely execute.

**Fix:** Add CSP headers restricting script-src, style-src, and connect-src to known origins.

### MEDIUM — CDN Resources Without Integrity Checks

```html
<!-- index.html:8 -->
<script src="https://cdn.tailwindcss.com"></script>
```

Tailwind CSS is loaded from CDN without Subresource Integrity (SRI) hashes. A CDN compromise could inject malicious code.

**Fix:** Use SRI hashes or bundle Tailwind at build time (recommended for production).

### LOW — No Input Sanitization on Search

Search queries are URL-encoded (`encodeURIComponent`) in `quranService.ts:86` but the raw input is not sanitized for display purposes.

---

## 2. Architecture & Code Quality

### 2.1 State Management — Prop Drilling

**File:** `App.tsx` (entire file)

All application state lives in `App.tsx` with 15+ `useState` hooks. Every child component receives data and callbacks via props, creating deep prop drilling chains. For example, `QuranReader` receives 11 props.

**Impact:** Adding new features requires threading props through multiple component layers.

**Recommendation:** Introduce React Context (at minimum) or a lightweight state manager like Zustand:

```
QuranContext       — chapters, verses, active chapter
AppearanceContext  — font, size, theme, line height
AudioContext       — playback state, current track
BookmarkContext    — bookmark CRUD operations
```

### 2.2 Duplicated Code

| Function | File 1 | File 2 |
|----------|--------|--------|
| `getLineHeightValue()` | `QuranReader.tsx:81-87` | `SettingsView.tsx:43-49` |

Identical function defined in two places. Should be extracted to a shared utility.

### 2.3 Unused Type Definition

The `AppState` interface in `types.ts:66-74` is defined but never used anywhere in the codebase. It also references `darkMode: boolean` which conflicts with the actual `Theme` type implementation.

### 2.4 Magic Numbers

Hard-coded values scattered throughout:

| Value | Meaning | Location |
|-------|---------|----------|
| `7` | Mishary Rashid Alafasy reciter ID | `quranService.ts:54` |
| `169` | Al-Sadi tafsir ID | `QuranReader.tsx:39` |
| `16` | Al-Muyassar translation ID | `quranService.ts:31` |
| `300` | Max verses per page | `quranService.ts:31` |
| `600` | Debounce delay (ms) | `ChapterList.tsx:31` |
| `500` | Scroll delay (ms) | `QuranReader.tsx:73` |

**Recommendation:** Extract to a `constants.ts` file.

### 2.5 No Error Boundaries

No React Error Boundaries exist. A runtime error in any component crashes the entire app with a white screen.

**Fix:** Add `<ErrorBoundary>` wrappers at least around:
- `QuranReader` (API-dependent)
- `AIChat` (external API)
- `ChapterList` (search API)

### 2.6 Effect Dependency Warning

In `AIChat.tsx:26-30`, the `useEffect` calls `handleSend` but doesn't include it in the dependency array. This may cause stale closure bugs:

```tsx
useEffect(() => {
  if (initialContext && messages.length === 1) {
    handleSend(); // handleSend not in deps
  }
}, [initialContext]);
```

### 2.7 Inline SVG Repetition

SVG icons (sparkle, bookmark, book, close, arrow) are repeated as inline JSX across 6+ files. This adds unnecessary bundle size and makes icon updates tedious.

**Recommendation:** Extract to an `Icons.tsx` component or use a lightweight icon library.

### 2.8 Audio Element Memory Leak

In `App.tsx:120-128`, new `Audio()` objects are created when switching chapters but the previous audio element's event listeners are never cleaned up:

```tsx
const audio = new Audio(url);
audio.addEventListener('ended', () => setIsPlaying(false));
// Previous audio's 'ended' listener is never removed
```

---

## 3. Performance Issues

### 3.1 No List Virtualization

**Files:** `ChapterList.tsx`, `QuranReader.tsx`

All 114 chapters are rendered as DOM nodes simultaneously. All verses (up to 286 for Al-Baqarah) are rendered at once. For long surahs, this creates hundreds of DOM nodes.

**Fix:** Use `react-window` or `react-virtuoso` for large lists.

### 3.2 No API Response Caching

Every navigation to a chapter re-fetches verses from the API (`QuranReader.tsx:43-51`). Going back and forth between chapters triggers repeated identical API calls.

**Fix:** Implement a simple in-memory cache or use `useSWR` / `react-query`:

```tsx
const versesCache = new Map<number, Verse[]>();
```

### 3.3 Tailwind CSS Full Framework via CDN

```html
<script src="https://cdn.tailwindcss.com"></script>
```

This loads the **entire** Tailwind CSS framework (~300KB) and processes it at runtime in the browser. In production, only the used classes should be included.

**Fix:** Use PostCSS + Tailwind purge in the Vite build pipeline. This typically reduces CSS to ~10-20KB.

### 3.4 No Code Splitting

All components are eagerly imported in `App.tsx`. The AI Chat, Settings, and Bookmarks views should be lazy-loaded since they aren't needed on initial render:

```tsx
const AIChat = React.lazy(() => import('./components/AIChat'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));
```

### 3.5 Font Loading Not Optimized

Five Google Fonts are loaded in a single request (`index.html:10`). This blocks rendering until all fonts are downloaded.

**Fix:** Add `font-display: swap` and consider subsetting Arabic fonts to reduce download size.

### 3.6 `fetchRandomVerse` is Inefficient

`quranService.ts:68-77` fetches ALL verses of a random chapter just to pick one random verse. This wastes bandwidth.

**Fix:** Use the Quran.com API's direct verse endpoint with a random key.

---

## 4. UX / Usability Issues

### 4.1 No Reading Progress / Last Position

There is no way to resume reading from where the user left off. Navigating away from the reader and coming back starts from the top of the chapter.

**Impact:** Major friction for daily readers.

### 4.2 AI Chat History Lost on Navigation

When the user navigates away from `View.AI_CHAT` and returns, the entire conversation is reset to the welcome message. There is no persistence.

### 4.3 Audio Has No Progress Bar

Audio playback only has play/pause. There is no:
- Progress indicator
- Seek functionality
- Time display (current / total)
- Verse-by-verse tracking during recitation

### 4.4 Single Reciter Only

The app is hardcoded to Mishary Rashid Alafasy (reciter ID 7). Users cannot choose their preferred reciter.

### 4.5 Bottom Nav Shows Reader Tab Without Context

The "القراءة" (Reader) tab in `BottomNav.tsx` is always visible but clicking it without first selecting a chapter shows nothing (no `activeChapter`).

### 4.6 No Chapter-to-Chapter Navigation

When reading a surah, there's no "Next Surah" / "Previous Surah" button. The user must go back to the home screen to pick the next one.

### 4.7 Search Limited to 20 Results

`quranService.ts:86` limits search to 20 results with no pagination or "Load More" option.

### 4.8 No Swipe Gestures

For a mobile-first app, there are no swipe gestures for:
- Navigating between chapters
- Dismissing the tafsir modal
- Going back

### 4.9 No Pull-to-Refresh

While `overscroll-behavior-y: none` prevents the default browser pull-to-refresh, no custom implementation exists for refreshing content.

### 4.10 Translation Toggle Not Persisted

`showTranslation` state defaults to `true` and is never saved to localStorage, unlike other settings.

### 4.11 No Loading/Error States for Failed API Calls

If `fetchChapters()` fails, the chapter list shows a spinner forever with no retry button or error message. Same for verse loading.

---

## 5. Accessibility (a11y)

### 5.1 Missing ARIA Labels

Most interactive elements lack `aria-label` attributes:
- Bottom navigation buttons
- Audio play/pause button
- Search input
- Theme selector buttons
- Font selector buttons
- Tafsir modal close button

Only the bookmark delete button in `BookmarksView.tsx:41` has an `aria-label`.

### 5.2 No Focus Management

When switching views, focus is not moved to the new content. Screen reader users have no indication that the view changed.

### 5.3 No Keyboard Navigation

The tafsir bottom sheet modal cannot be closed with Escape key. There is no focus trap within the modal.

### 5.4 Color Contrast

The amber-on-zinc color scheme may not meet WCAG AA contrast requirements in some combinations, particularly:
- `text-zinc-400` on `bg-zinc-50` (light mode)
- `text-amber-500` on `bg-black` (dark mode)

### 5.5 `user-scalable=no` in Viewport

```html
<meta name="viewport" content="..., maximum-scale=1.0, user-scalable=no" />
```

This prevents users from zooming, which is an accessibility violation (WCAG 1.4.4).

---

## 6. Missing Infrastructure

### 6.1 No Testing

Zero test files exist. No testing framework is configured.

**Recommendation:**
- Add Vitest (pairs naturally with Vite)
- Add React Testing Library for component tests
- Add Playwright for E2E tests
- Target >80% coverage for services and critical components

### 6.2 No Linting or Formatting

No ESLint or Prettier configuration exists.

**Recommendation:**
- Add ESLint with `@typescript-eslint` and `eslint-plugin-react-hooks`
- Add Prettier for consistent formatting
- Add lint-staged + husky for pre-commit hooks

### 6.3 No CI/CD Pipeline

No GitHub Actions, Vercel, or Netlify configuration.

**Recommendation:** Add a CI pipeline that:
1. Runs lint
2. Runs type-check (`tsc --noEmit`)
3. Runs tests
4. Builds production bundle
5. Deploys to staging/production

### 6.4 No PWA Support

The app has no:
- `manifest.json` (required for PWA installability)
- Service worker (required for offline support)
- App icons in multiple sizes

For a mobile-first Quran app, offline reading is essential.

### 6.5 No Analytics or Error Tracking

No integration with any analytics or error tracking service. Production errors will go unnoticed.

### 6.6 No Environment Variable Validation

The app silently fails if `GEMINI_API_KEY` is missing. Should validate on startup.

---

## 7. Proposed Features

### Tier 1 — High Impact, Foundational

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| F1 | **Reading Progress Tracker** | Save last-read verse per chapter. Show resume button on home screen. Persist in localStorage. | Low |
| F2 | **Verse of the Day** | Display a featured verse on the home screen. `fetchRandomVerse()` already exists but is unused. Rotate daily using date-based seed. | Low |
| F3 | **Offline Mode (PWA)** | Service worker caches chapters, verses, and fonts. Users can read without internet. Essential for a Quran app. | Medium |
| F4 | **Audio Progress Bar** | Show current position, total duration, and seek slider for recitation audio. Display time as `mm:ss / mm:ss`. | Low |
| F5 | **Next/Previous Chapter Navigation** | Add navigation buttons at the bottom of the reader to go to adjacent chapters without returning to home. | Low |

### Tier 2 — Enhanced Reading Experience

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| F6 | **Multiple Reciters** | Let users choose from 10+ reciters (Abdul Basit, Al-Sudais, Al-Ghamdi, etc.). Quran.com API supports this natively. | Low |
| F7 | **Verse-by-Verse Audio Sync** | Highlight each verse as it's being recited. Use the verse timing API from Quran.com. | Medium |
| F8 | **Juz / Hizb / Manzil Navigation** | Browse the Quran by its traditional divisions (30 Juz, 60 Hizb). Add a secondary tab or filter on the home screen. | Medium |
| F9 | **Word-by-Word Translation** | Tap any Arabic word to see its meaning, root, and grammar. Quran.com has word-by-word data. | High |
| F10 | **Tajweed Color Coding** | Display Quranic text with color-coded tajweed rules (idgham, ikhfa, qalqalah, etc.). Use `text_uthmani_tajweed` from the API. | Medium |

### Tier 3 — Study & Engagement

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| F11 | **Personal Notes on Verses** | Allow users to add, edit, and delete private notes on any verse. Store in localStorage or IndexedDB. | Medium |
| F12 | **Bookmark Collections** | Organize bookmarks into named folders/collections (e.g., "Favorites", "To Memorize", "Study Topics"). | Medium |
| F13 | **Reading Plans / Khatma** | Create daily reading goals. Track progress toward completing the full Quran (Khatma). Show statistics. | High |
| F14 | **Share Verse Cards** | Generate beautiful verse cards (image) for sharing on social media. Include verse text, translation, and surah info. | Medium |
| F15 | **AI Conversation History** | Persist AI chat sessions so users can revisit previous conversations with "Noor". | Low |

### Tier 4 — Advanced Features

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| F16 | **Mushaf Mode** | Page-by-page display matching the physical Madani Mushaf layout (604 pages). Fixed page sizes. | High |
| F17 | **Memorization Mode (Hifz)** | Hide portions of verses to test memorization. Progressive reveal. Track memorized sections. | High |
| F18 | **Search Filters** | Filter search results by surah, juz, revelation type (Makki/Madani), or topic. | Medium |
| F19 | **Recitation Speed Control** | Adjust audio playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x) for learning/memorization. | Low |
| F20 | **Prayer Times + Surah Suggestions** | Integrate prayer times based on location. Suggest relevant surahs for each prayer (e.g., Al-Kahf on Friday). | High |

---

## 8. Priority Matrix

```
                    HIGH IMPACT
                        │
           F1  F3  F5   │   F7  F13  F16
           F2  F4       │   F10 F17  F20
                        │
  LOW EFFORT ───────────┼─────────── HIGH EFFORT
                        │
           F6  F15 F19  │   F9   F11  F18
                        │   F8   F12  F14
                        │
                    LOW IMPACT
```

### Recommended Implementation Order

**Phase 1 — Quick Wins (Immediate)**
1. F1: Reading Progress Tracker
2. F2: Verse of the Day
3. F4: Audio Progress Bar
4. F5: Next/Previous Chapter
5. Fix: XSS sanitization (Critical)
6. Fix: Translation toggle persistence

**Phase 2 — Core Enhancements**
7. F6: Multiple Reciters
8. F15: AI Conversation History
9. F19: Recitation Speed Control
10. Fix: API response caching
11. Fix: Error boundaries
12. Fix: Accessibility (ARIA labels, focus management)

**Phase 3 — PWA & Offline**
13. F3: Offline Mode
14. Add manifest.json + service worker
15. Bundle Tailwind CSS properly
16. Add testing infrastructure

**Phase 4 — Study Features**
17. F7: Verse-by-Verse Audio Sync
18. F10: Tajweed Color Coding
19. F11: Personal Notes
20. F12: Bookmark Collections
21. F8: Juz/Hizb Navigation

**Phase 5 — Advanced**
22. F13: Reading Plans / Khatma
23. F14: Share Verse Cards
24. F16: Mushaf Mode
25. F17: Memorization Mode

---

## Summary of Critical Fixes

| Priority | Issue | File(s) | Effort |
|----------|-------|---------|--------|
| P0 | XSS via dangerouslySetInnerHTML | ChapterList, QuranReader | 1 hour |
| P0 | Audio element memory leak | App.tsx | 30 min |
| P1 | No error boundaries | App.tsx (new) | 2 hours |
| P1 | Tailwind CDN in production | index.html, vite.config | 2 hours |
| P1 | showTranslation not persisted | App.tsx | 10 min |
| P2 | Duplicate getLineHeightValue | QuranReader, SettingsView | 15 min |
| P2 | Unused AppState type | types.ts | 5 min |
| P2 | Missing ARIA labels | All components | 3 hours |
| P2 | user-scalable=no | index.html | 5 min |
| P3 | No caching of API responses | quranService.ts | 2 hours |
| P3 | Inline SVG extraction | All components | 3 hours |
| P3 | Constants extraction | Multiple files | 1 hour |

---

*This review was generated by scanning all 14 source files across the نور القرآن codebase.*

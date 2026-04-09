# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server on http://localhost:3002
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

No test framework or linter is configured.

## Architecture

React + Vite app for Video KYC (VKYC) — an interactive video flow where users consent, record themselves, confirm details, and rate their experience.

### Core pattern: KPoint widget system

The app embeds a KPoint video player. Timed overlays are driven by KPoint's **markup widget system**, not manual timers:

- `VIDEO_PARAMS` and `WIDGETS_CONFIG` constants in `VideoPlayer.jsx` define when each overlay template appears (via `start_time`/`end_time` and `template: '#element-id'`)
- Each widget entry has a `callback` name (e.g., `'consent-callback'`) registered on `window` — KPoint calls `onRender(self)` when the widget activates, giving access to `self.controller.player`
- The player instance is obtained from callbacks, not by polling globals

### VideoPlayer.jsx is the orchestrator

`VideoPlayer.jsx` owns all interaction logic:
- **Constants at module top**: `TIMESTAMPS`, `VIDEO_PARAMS`, `WIDGETS_CONFIG`
- **`useEffect`**: registers window callbacks for KPoint widgets, sets up delegated click handlers on `document`, and returns cleanup
- **Delegated event handling**: all button clicks use `data-action` attributes matched via `e.target.closest('[data-action="..."]')` — sub-components do NOT have their own event handlers
- **Sub-components** (ConsentScreen, ConfirmationScreen, etc.) are pure render-only templates that just return JSX with `data-action` attributes

### Screen visibility

Screens use CSS class toggling (`active` class), not React state, because KPoint's widget system operates on the DOM directly. The `showScreen(id)` / `hideAllScreens()` helpers manage this.

### Recording

`RecordingService.js` is a plain JS class (not a React component) that wraps `getUserMedia` and `MediaRecorder`. It's instantiated once at module level in `VideoPlayer.jsx`.

### CSS

Tailwind CSS v4 is available via `@tailwindcss/vite` plugin. **Always use Tailwind utility classes for styling. Do not create custom CSS files — use Tailwind classes directly in JSX.** Legacy custom styles exist under `src/styles/` but new code must use Tailwind only.

### Video flow sequence

Consent (31s) → Camera recording → Confirmation (40-50s) → Understood (96s) → Acknowledgement (110-133s) → Auto-stop recording (134s) → Rating (137s)

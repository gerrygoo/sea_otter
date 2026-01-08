# Plan: Rebranding & PWA Enhancement

## Phase 1: Asset Generation [checkpoint: 5adaa0c]
- [x] Task: Create `static/pwa-192x192.png` 5adaa0c
    - Convert `src/lib/assets/favicon.svg` to a 192x192 PNG.
- [x] Task: Create `static/pwa-512x512.png` 5adaa0c
    - Convert `src/lib/assets/favicon.svg` to a 512x512 PNG.
- [x] Task: Conductor - User Manual Verification 'Asset Generation' (Protocol in workflow.md) 5adaa0c

## Phase 2: Configuration & Code Updates [checkpoint: 26b762f]
- [x] Task: Update `vite.config.ts` PWA manifest 26b762f
    - Change `name` to "G's Swimming Generator"
    - Change `short_name` to "G's Swim"
    - Update `icons` array to point to the new PNG files in `static/` (e.g., `pwa-192x192.png`).
- [x] Task: Update App Title in `src/app.html` 26b762f
    - Change `<title>Sea Otter</title>` (or verify where the title is set if dynamically) to "G's Swimming Generator".
    - *Note: If title is set in `+layout.svelte` via `<svelte:head>`, update it there.*
- [x] Task: Update UI Header in `src/routes/+page.svelte` 26b762f
    - Change the `<h1>` text "Swimming Generator" (or similar) to "G's Swimming Generator".
- [x] Task: Update `static/manifest.webmanifest` (if it exists manually) 26b762f
    - Check if a manual file exists and update it, otherwise relying on Vite config is fine.
- [x] Task: Conductor - User Manual Verification 'Configuration & Code Updates' (Protocol in workflow.md) 26b762f

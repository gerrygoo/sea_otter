# Track Specification: Rebranding & PWA Enhancement

## Overview
This track focuses on rebranding the application from "Sea Otter" to "G's Swimming Generator" and enhancing the Progressive Web App (PWA) installation experience by providing proper assets and metadata.

## Functional Requirements
1.  **Rebranding:**
    *   Change the application name everywhere (UI, Metadata, Manifest) to "G's Swimming Generator".
    *   Use the short name "G's Swim" for the PWA icon label to prevent truncation on mobile devices.
2.  **PWA Assets:**
    *   Generate standard PNG icons (192x192 and 512x512) derived from the existing wave-style favicon.
    *   Update the `manifest.webmanifest` (via `vite.config.ts`) to point to these new PNG assets instead of the SVG.

## Technical Requirements
*   **Vite Config:** Update the `SvelteKitPWA` plugin configuration in `vite.config.ts`:
    *   `name`: "G's Swimming Generator"
    *   `short_name`: "G's Swim"
    *   `icons`: Update list to include the new PNG files.
*   **HTML Metadata:** Update the `<title>` tag in `src/app.html` or the relevant layout/page to "G's Swimming Generator".
*   **UI Updates:** Update the H1 header on the landing page (`src/routes/+page.svelte`) to "G's Swimming Generator".
*   **Asset Generation:** Create `static/pwa-192x192.png` and `static/pwa-512x512.png` using the design language of `src/lib/assets/favicon.svg`.

## Acceptance Criteria
*   The browser tab title reads "G's Swimming Generator".
*   The PWA install prompt shows "G's Swimming Generator".
*   The installed app icon on a mobile home screen is labeled "G's Swim".
*   The installed app icon uses the new high-res PNG assets.
*   The main landing page header reads "G's Swimming Generator".

## Out of Scope
*   Changing the domain/URL.
*   Creating a completely new logo design (we are reusing the wave motif).

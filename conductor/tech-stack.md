# Technology Stack

## Frontend Framework
*   **Framework:** [SvelteKit](https://kit.svelte.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Deployment:** [GitHub Pages](https://pages.github.com/) via GitHub Actions, using `@sveltejs/adapter-static` for static site generation (SSG).

## State Management & Logic
*   **State Management:** [Svelte Stores](https://svelte.dev/docs/svelte-store) for reactive application state.
*   **Generation Engine:** Pure TypeScript modules for the core workout generation logic, ensuring the engine is platform-agnostic and easily testable.

## Styling & UI
*   **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
*   **Design Principles:** High-contrast, mobile-first design as defined in the Product Guidelines.

## Development Tools
*   **Build Tool:** [Vite](https://vitejs.dev/) (bundled with SvelteKit).
*   **Testing:** [Vitest](https://vitest.dev/) for unit testing, [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/) for component testing, and [Playwright](https://playwright.dev/) for end-to-end testing.
*   **Validation:** [Zod](https://zod.dev/) for schema validation and data integrity.
*   **PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) for offline support.
*   **Asset Generation:** [Sharp](https://sharp.pixelplumbing.com/) for high-performance image processing.
*   **Linting/Formatting:** [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).
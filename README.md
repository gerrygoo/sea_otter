# Sea Otter — G's Swimming Workout Generator

A mobile-first web app that generates structured lap-swimming workouts from a
rich set of parameters: pool size, available time or target distance,
Critical Swim Speed (CSS), per-stroke preferences, training focus, and
available gear. Built for poolside use — high contrast, readable at a
glance, works offline as a PWA.

Deployed at [otter.ggo.blue](https://otter.ggo.blue).

## What it does

Given your inputs, the engine generates several distinct, structurally sound
workout options (warmup / main set / cooldown), each paced off your CSS.
From there you can:

- Compare and select from generated options
- Explore "similar" variations of a workout you like (space traversal)
- Save workouts to history, favorite and rename them
- Review any past workout in detail

The full product concept and workout-design logic (intensity zones, training
focus categories, warmup/cooldown structure) live in
[`conductor/product.md`](./conductor/product.md). How the generation engine
actually implements that logic is documented in
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Tech stack

- [SvelteKit](https://kit.svelte.dev/) + TypeScript, statically built with
  `@sveltejs/adapter-static` and deployed to GitHub Pages
- [Svelte stores](https://svelte.dev/docs/svelte-store) for app state
  (`src/lib/stores`)
- The workout generation engine (`src/lib/engine`) is plain, framework-free
  TypeScript — no Svelte dependency, fully unit-testable in isolation
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zod](https://zod.dev/) for schema validation (workout data in/out of
  `localStorage`)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
  for unit/component tests, [Playwright](https://playwright.dev/) for e2e
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/) for offline support

See [`conductor/tech-stack.md`](./conductor/tech-stack.md) for more detail.

## Project structure

```
src/
  lib/
    engine/          Pure TS workout generation engine — see docs/ARCHITECTURE.md
      generators/     Individual set generators (basic, pyramid, descending, drills, ...)
      types.ts        Core domain types (WorkoutParameters, SwimSet, Workout, ...)
      schema.ts        Zod schemas mirroring the domain types
      pace_logic.ts   CSS-based pacing / intensity zones
      modality.ts     Swim/Pull/Kick/Drill/Hypoxic/Underwater cross-cutting logic
      mutation.ts     "Find similar" workout variation logic
    stores/           Svelte stores: generation, history, settings
    components/       Svelte UI components
    utils/            localStorage persistence helpers
  routes/             SvelteKit pages (generator, history, favorites)
e2e/                  Playwright end-to-end tests
conductor/            Product spec, guidelines, tech stack, workflow, and
                       feature-track history (originally written for an
                       agentic dev workflow, still useful as design docs)
```

## Getting started

```bash
npm install
npm run dev            # start dev server (add --open to launch a browser tab)
```

## Common commands

| Command | Does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build (static output to `build/`) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Sync SvelteKit types and run `svelte-check` |
| `npm run test:unit` | Run Vitest unit/component tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm test` | Run unit tests then e2e tests |
| `npm run lint` | Prettier check + ESLint |
| `npm run format` | Prettier write |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static site and publishes it to GitHub Pages (custom domain configured via
`static/CNAME`).

## Further reading

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — how the generation
  engine works internally
- [`conductor/product.md`](./conductor/product.md) — product concept and
  workout-design logic (CSS zones, training focus, warmup/cooldown structure)
- [`conductor/product-guidelines.md`](./conductor/product-guidelines.md) —
  visual identity, tone, UX principles
- [`conductor/workflow.md`](./conductor/workflow.md) — development workflow
  and code review checklist
- [`conductor/code_styleguides/`](./conductor/code_styleguides/) — style
  guides
- [`conductor/tracks.md`](./conductor/tracks.md) and
  [`conductor/archive/`](./conductor/archive/) — history of feature tracks
  with their specs and plans

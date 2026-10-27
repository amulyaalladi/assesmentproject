# Team Workflow Board

A small Trello/Jira-style board built with **React 19 + TypeScript + Tailwind CSS v4**, backed by `localStorage`

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # Vitest + React Testing Library
npm run typecheck  # tsc --noEmit
npm run lint       # eslint + prettier
```

## Features

- Board with **Backlog / In Progress / Done** columns; move tasks by **drag-and-drop** or the status dropdown on each card (keyboard/touch friendly)
- Create / edit / delete tasks with client-side validation and accessible error messages
- **Dirty-state guard**: closing a changed form asks to discard; `beforeunload` warns on refresh/tab close
- Filter by status (multi-select), priority and text search (title + description); sort by created, updated or priority
- Filters and sort live in the **URL query string** (`?status=Backlog,Done&priority=High&q=login&sort=priority&dir=asc`)
- Persistence in `localStorage` with a **versioned schema and migration** (v1 → v2) and a one-time notification when a migration runs
- Empty / error states: no tasks, filters hide everything, storage unavailable or corrupt, save failure, validation errors

## Project structure

```
src/
  components/ui/        Design system: Button, TextInput, TextArea, Select, Badge, Card, Modal, Toast/Alert
  features/tasks/
    components/         Presentational: Board, Column, TaskCard, FilterBar, TaskFormModal, EmptyState
    hooks/              useTaskFilters (URL), useTaskForm, useBeforeUnload
    state/              tasksReducer (pure), TasksContext, TasksProvider (persistence)
    storage/            taskStorage (load/save), migrations (schema versions)
    utils/              filterTasks, filtersUrl, validateTask
    TaskBoardPage.tsx   Container wiring everything together
  lib/relativeTime.ts   "3 hours ago" via Intl.RelativeTimeFormat
  test/                 Test setup and render helpers
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the component hierarchy, storage/migration design and a refactor write-up.

## Key decisions

| Decision | Why |
| --- | --- |
| `useReducer` + Context, no Zustand/Redux | One entity type and a handful of actions; a pure reducer is easy to test. State and actions are split into two contexts so action-only consumers don't re-render. |
| URL as the source of truth for filters | Shareable, refresh-safe, back/forward works. Read with `useSyncExternalStore`, so there's no duplicated React state to keep in sync. |
| Native HTML5 drag-and-drop | No dependency. The status `<select>` is the accessible equivalent, since native DnD is not keyboard accessible. |
| Own `Intl.RelativeTimeFormat` helper | Avoids a date library for a single formatting need. |
| Vitest instead of Jest | Same API (`describe/it/expect`, RTL), but reuses the Vite config with no extra transform setup. |
| Tailwind v4 with `@theme` tokens | Colours and fonts are defined once; components use semantic names like `brand-600`. |

## Known limitations / trade-offs

- `localStorage` only: ~5 MB cap, no cross-tab sync, no multi-device sync. IndexedDB would be the next step for larger data.
- Relative times ("3 hours ago") are computed on render and don't tick live.
- Within a column, order comes from the active sort; there is no manual reordering.
- Native drag-and-drop doesn't work on most touch devices (use the status dropdown there).
- Priority filter is single-select; status filter is multi-select (as specified).
- Filter changes use `replaceState`, so back/forward doesn't step through each filter change.

## Performance note

Changing one task's status re-rendered every card (30 of 30 in a 30-task board). `TaskCard` is now `React.memo`, callbacks are stable, and the reducer preserves identity of untouched tasks, so only 1 card re-renders. This is pinned by `TaskCard.perf.test.tsx`, which counts renders (via `relativeTime` calls) instead of relying on eyeballing.

> **To do before submitting:** also confirm this once in React DevTools → Profiler ("Highlight updates when components render") and add a screenshot or sentence here, since the assignment asks for DevTools evidence.

## AI assistance disclosure
## AI assistance disclosure

I used Claude (Anthropic) as a coding assistant for this assignment.

**Where AI was used**
- Generating the initial project structure, the component library (`src/components`), the task state layer, the versioned storage/migration layer, the tests and the first drafts of these docs.
- Debugging help when I hit issues while running the app.

**What I changed or fixed after reviewing the generated code**
- Fixed the "useTasksState must be used inside <TasksProvider>" runtime error by correcting where the providers are mounted.
- Fixed invisible buttons caused by the custom `brand-*` colour tokens not applying; switched to Tailwind's built-in `indigo` palette.


**What I verified myself**
- Ran the app locally and manually checked: <creating/editing a task, drag-and-drop, status dropdown, filters in the URL, discard warning, migration notice>.
- Ran `npm test`, `npm run typecheck` and `npm run lint`.


**Things I understand well enough to explain**
- Why state uses `useReducer` + Context, how filters sync with the URL, and how the storage schema versioning and migration work.

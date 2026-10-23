# Architecture & Design Notes

## Component hierarchy

```
main.tsx
└─ ToastProvider                      (ephemeral notifications, aria-live)
   └─ TasksProvider                   (tasks state + persistence; two contexts)
      └─ App
         └─ TaskBoardPage             (container: filters from URL, dialogs, derived list)
            ├─ Alert                  (load / save errors)
            ├─ EmptyState             (no tasks | filters hide everything)
            ├─ FilterBar              (TextInput, status checkbox group, Select x3)
            ├─ Board
            │  └─ Column x3           (drop target, <section aria-labelledby>)
            │     └─ TaskCard         (memo; Card + Badge + Select + Button)
            └─ TaskFormModal          (mounted only while open)
               └─ Modal (+ Header/Title/Body/Footer)
                  └─ TextInput / TextArea / Select / Button / Alert
```

**Container vs presentational:** `TaskBoardPage` is the only component that knows about state, the URL and toasts. `Board`, `Column`, `TaskCard`, `FilterBar` receive data and callbacks via props and know nothing about storage or routing.

## Data flow

```
user action → TaskBoardPage handler → TasksActions (stable callbacks)
           → dispatch → tasksReducer (pure) → new tasks array
           → TasksProvider effect → saveTasks() → localStorage
URL query ⇄ useTaskFilters (useSyncExternalStore) → filters → filterAndSortTasks → Board
```

## Component library (`src/components/ui`)

- **Composition over props explosion:** `Card` and `Modal` expose `Header/Body/Footer` (and `Modal.Title`) slots instead of title/footer/actions props.
- **`Field`** is a shared shell that renders the label, hint and error and passes `id`, `aria-invalid`, `aria-describedby`, `aria-required` to the control, so `TextInput`, `TextArea` and `Select` are accessible in exactly the same way.
- **`Modal`**: `role="dialog"`, `aria-modal`, `aria-labelledby` (wired by `Modal.Title` via context), focus moves in on open, Tab is trapped, Escape/backdrop call `onRequestClose` (the parent decides whether to close, which the dirty-form guard relies on), focus returns to the trigger, and body scroll is locked.
- **Toast**: `ToastProvider` + `useToast()`; messages render in an `aria-live="polite"` region so they're announced without stealing focus.

## Storage versioning and migration

Stored shape: `{ "schemaVersion": <number>, "tasks": [...] }` under key `twb:tasks`.

| Version | Task shape |
| --- | --- |
| v1 | `{ id, title, completed: boolean, createdAt }` |
| v2 (current) | full `Task`: description, status, priority, assignee, tags, createdAt, updatedAt |

How it works (`storage/migrations.ts`, `storage/taskStorage.ts`):

1. `loadTasks()` reads and parses storage, then calls `migrate(parsed)`.
2. `migrate` runs `migrations[v]` for each version from the stored one up to `CURRENT_SCHEMA_VERSION`, one step at a time (v1→v2 maps `completed` to `Done`/`Backlog`, defaults priority to `Medium`, and sets `updatedAt = createdAt`).
3. Rows are validated with a runtime type guard (`isTask`); invalid rows are dropped rather than crashing the UI.
4. If a migration ran, the upgraded data is saved immediately (so it runs once) and the UI shows an info toast.
5. Safety: data from a **newer** schema than the app understands, or unparseable data, is reported as an error and the provider **disables writes**, so existing data is never overwritten by an empty list.

Adding v3: bump `CURRENT_SCHEMA_VERSION`, add `migrations[2]`, add a test. Nothing else changes.

## Refactors made during the build

1. **Modal focus effect → refs.** The first version had `[open, initialFocusRef]` as effect dependencies. When the form toggled its inline "discard changes?" confirmation, the changed ref would re-run the effect, and its cleanup would restore focus to the trigger button before re-focusing, i.e. a focus jump. Now `onRequestClose` and `initialFocusRef` are read through refs and the effect depends only on `open`; the form moves focus into/out of the confirmation itself.
2. **`useTaskForm` bind/setField.** Initially `setField` called `setErrors` inside a `setValues` updater (a side effect inside a state updater, which StrictMode double-invokes), and `bind` used an unreadable ternary to map `tagsText` to the `tags` error. Replaced with computing `next` from current values and an explicit `ERROR_KEY` lookup table.
3. **Fast Refresh warnings.** `controlClasses` (from `Field.tsx`) and the toast context/`useToast` (from `Toast.tsx`) moved to their own files so component files only export components.

## Testing strategy

- **Unit:** reducer, filter/sort, URL (de)serialisation, validation, relative time, storage + migrations.
- **Component:** `Modal` (a11y attributes, focus trap, Escape + focus restore).
- **Integration (`TaskBoardPage.test.tsx`):** create-task workflow, validation + focus, status move, discard guard, URL-driven filters/sort, empty states, migration notice, corrupt-storage safety.
- **Performance:** render-count test for `TaskCard`.

## What I'd do next

- Move persistence to IndexedDB behind the same `loadTasks/saveTasks` interface.
- Sync across tabs with the `storage` event.
- Manual ordering within columns (and an accessible keyboard reorder).
- E2E tests (Playwright) for real drag-and-drop.

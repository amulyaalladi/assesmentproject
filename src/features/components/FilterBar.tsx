import { Button, Select, TextInput, cn } from '../../components'
import {
  PRIORITIES,
  SORT_FIELDS,
  STATUSES,
  type Priority,
  type SortDirection,
  type SortField,
  type Status,
  type TaskFilters,
} from '../types'
import { hasActiveFilters } from '../utlis/filterTasks'

const SORT_LABELS: Record<SortField, string> = {
  createdAt: 'Created date',
  updatedAt: 'Updated date',
  priority: 'Priority',
}

interface FilterBarProps {
  filters: TaskFilters
  onChange: (patch: Partial<TaskFilters>) => void
  onReset: () => void
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const toggleStatus = (s: Status) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s]
    onChange({ statuses: next })
  }

  return (
    <form
      role="search"
      aria-label="Filter and sort tasks"
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12"
    >
      <TextInput
        className="md:col-span-4"
        label="Search"
        type="search"
        placeholder="Title or description"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
      />

      <fieldset className="md:col-span-3">
        <legend className="mb-1 text-sm font-medium text-slate-700">Status</legend>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const checked = filters.statuses.includes(s)
            return (
              <label
                key={s}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600',
                  checked
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-300 bg-white text-slate-700',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleStatus(s)}
                />
                {s}
              </label>
            )
          })}
        </div>
      </fieldset>

      <Select
        className="md:col-span-2"
        label="Priority"
        value={filters.priority ?? ''}
        onChange={(e) => onChange({ priority: (e.target.value || null) as Priority | null })}
        options={[{ value: '', label: 'Any' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
      />

      <div className="flex gap-2 md:col-span-3">
        <Select
          className="flex-1"
          label="Sort by"
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as SortField })}
          options={SORT_FIELDS.map((f) => ({ value: f, label: SORT_LABELS[f] }))}
        />
        <Select
          className="w-28"
          label="Order"
          value={filters.sortDir}
          onChange={(e) => onChange({ sortDir: e.target.value as SortDirection })}
          options={[
            { value: 'desc', label: 'Newest / High' },
            { value: 'asc', label: 'Oldest / Low' },
          ]}
        />
      </div>

      {hasActiveFilters(filters) && (
        <div className="md:col-span-12">
          <Button variant="secondary" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </form>
  )
}

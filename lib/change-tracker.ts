/**
 * Utilities for tracking changes in forms
 */

export type ChangeTracker<T> = {
  original: T
  current: T
  changed: Set<keyof T>
}

export function createChangeTracker<T extends Record<string, any>>(initialData: T): ChangeTracker<T> {
  return {
    original: { ...initialData },
    current: { ...initialData },
    changed: new Set(),
  }
}

export function updateTrackedValue<T extends Record<string, any>>(
  tracker: ChangeTracker<T>,
  key: keyof T,
  value: any
): void {
  tracker.current[key] = value

  // Track if this is different from original
  const isChanged = JSON.stringify(tracker.original[key]) !== JSON.stringify(value)
  if (isChanged) {
    tracker.changed.add(key)
  } else {
    tracker.changed.delete(key)
  }
}

export function getChangedFields<T extends Record<string, any>>(tracker: ChangeTracker<T>): Partial<T> {
  const delta: Partial<T> = {}
  tracker.changed.forEach((key) => {
    delta[key] = tracker.current[key]
  })
  return delta
}

export function hasChanges<T>(tracker: ChangeTracker<T>): boolean {
  return tracker.changed.size > 0
}

export function getChangesSummary<T extends Record<string, any>>(tracker: ChangeTracker<T>): string[] {
  return Array.from(tracker.changed).map((key) => {
    const original = tracker.original[key]
    const current = tracker.current[key]
    return `${String(key)}: ${JSON.stringify(original)} → ${JSON.stringify(current)}`
  })
}

export function resetTracker<T extends Record<string, any>>(tracker: ChangeTracker<T>): void {
  tracker.original = { ...tracker.current }
  tracker.changed.clear()
}

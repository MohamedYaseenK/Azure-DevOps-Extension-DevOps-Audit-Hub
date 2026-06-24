import type { WorkItemDetail, Contributor } from '../api/adoApi'
import { getExpectedWorkingHours } from '../api/adoApi'

export interface AnomalyItem {
  type:    'zero_period' | 'task_effort' | 'working_hours' | 'zero_commits'
  message: string
  detail?: WorkItemDetail   // populated for task-level anomalies
}

export interface AnomalyResult {
  hasAnomaly: boolean
  items:      AnomalyItem[]
}

export function detectAnomalies(
  contributor: Contributor,
  dateRange:   'today' | 'week' | 'month'
): AnomalyResult {
  const items: AnomalyItem[] = []

  // Rule (i) — 0 hrs of work logged in the selected period
  if (contributor.totalEffortHours === 0) {
    items.push({
      type:    'zero_period',
      message: `0 logged hours this ${dateRange}`,
    })
  }

  // Rule (i) — per-task effort outside 1–3 hrs (itemized)
  for (const wi of contributor.workItems) {
    if (wi.effort === 0) continue // no effort logged on this task — not a range violation
    if (wi.effort < 1 || wi.effort > 3) {
      items.push({
        type: 'task_effort',
        message: `Work Item #${wi.id} ("${wi.title}") — ${wi.effort}hrs ${
          wi.effort < 1 ? 'below 1hr minimum' : 'exceeds 3hr limit'
        }`,
        detail: wi,
      })
    }
  }

  // Rule (ii) — total logged hours outside 75%–125% of expected working hours
  const expected = getExpectedWorkingHours(dateRange)
  const minHours = expected * 0.75
  const maxHours = expected * 1.25

  if (contributor.totalEffortHours > 0) {
    if (contributor.totalEffortHours < minHours) {
      items.push({
        type: 'working_hours',
        message: `${contributor.totalEffortHours.toFixed(1)}hrs logged — below 75% of expected ${expected.toFixed(0)}hrs`,
      })
    } else if (contributor.totalEffortHours > maxHours) {
      items.push({
        type: 'working_hours',
        message: `${contributor.totalEffortHours.toFixed(1)}hrs logged — exceeds 125% of expected ${expected.toFixed(0)}hrs`,
      })
    }
  }

  // Rule (ii) — 0 commits in the selected period
  if (contributor.commits.length === 0) {
    items.push({
      type:    'zero_commits',
      message: `0 commits this ${dateRange}`,
    })
  }

  return {
    hasAnomaly: items.length > 0,
    items,
  }
}
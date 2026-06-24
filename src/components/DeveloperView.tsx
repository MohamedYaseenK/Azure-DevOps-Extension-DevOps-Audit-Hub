import { useEffect, useState } from 'react'
import type { Developer } from '../types'
import { fetchContributorDetail } from '../api/adoApi'
import type { Contributor } from '../api/adoApi'
import { detectAnomalies } from '../anomaly/detector'
import type { AnomalyResult } from '../anomaly/detector'

interface Props {
  developer: Developer
  dateRange: 'today' | 'week' | 'month'
}

type Tab = 'overview' | 'commits' | 'workitems' | 'prs' | 'effort'

export default function DeveloperView({ developer, dateRange }: Props) {
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [anomaly,      setAnomaly]     = useState<AnomalyResult | null>(null)
  const [loading,      setLoading]     = useState(true)
  const [error,        setError]       = useState<string | null>(null)
  const [tab,          setTab]         = useState<Tab>('overview')

  useEffect(() => {
    loadData()
    setTab('overview')
  }, [developer.id, dateRange])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const detail = await fetchContributorDetail(developer.id, dateRange)
      if (!detail) {
        setError('No data found for this contributor in the selected period.')
        return
      }
      setContributor(detail)
      setAnomaly(detectAnomalies(detail, dateRange))
    } catch {
      setError('Failed to load developer data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading {developer.name}'s activity...</p>
        </div>
      </div>
    )
  }

  if (error || !contributor) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={loadData} className="mt-3 text-sm text-red-500 underline">Retry</button>
      </div>
    )
  }

  const tabs: { key: Tab, label: string, count?: number }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'commits',   label: 'Commits',    count: contributor.commits.length },
    { key: 'workitems', label: 'Work Items', count: contributor.workItems.length },
    { key: 'prs',       label: 'Pull Requests', count: contributor.prs.length },
    { key: 'effort',    label: 'Effort by Day' },
  ]

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {contributor.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{contributor.displayName}</h2>
              <p className="text-sm text-gray-500">{contributor.email}</p>
            </div>
          </div>
          {anomaly && (
            anomaly.hasAnomaly
              ? <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  🔴 {anomaly.items.length} issue{anomaly.items.length !== 1 ? 's' : ''} detected
                </span>
              : <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  ✅ Normal
                </span>
          )}
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-4 gap-4">
        <Metric label="Commits"     value={contributor.commits.length}    flagBad={contributor.commits.length === 0} />
        <Metric label="Pull Requests" value={contributor.prs.length} />
        <Metric label="Work Items"  value={contributor.workItems.length} />
        <Metric label="Effort (hrs)" value={contributor.totalEffortHours.toFixed(1)} flagBad={contributor.totalEffortHours === 0} />
      </div>

      {/* TAB SELECTOR — dropdown style */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                ${tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'overview' && <OverviewTab anomaly={anomaly} />}
          {tab === 'commits'   && <CommitsTab   commits={contributor.commits} />}
          {tab === 'workitems' && <WorkItemsTab workItems={contributor.workItems} />}
          {tab === 'prs'       && <PrsTab       prs={contributor.prs} />}
          {tab === 'effort'    && <EffortByDayTab workItems={contributor.workItems} />}
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function Metric({ label, value, flagBad }: { label: string, value: number | string, flagBad?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 tabular-nums ${flagBad ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

function OverviewTab({ anomaly }: { anomaly: AnomalyResult | null }) {
  if (!anomaly || anomaly.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-green-600 font-medium">✅ No anomalies detected for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Detected Issues</h3>
      {anomaly.items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <span className="text-red-500 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm text-gray-800">{item.message}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.type.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommitsTab({ commits }: { commits: { commitId: string, comment: string, date: string }[] }) {
  if (commits.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No commits in this period.</p>
  }
  return (
    <div className="divide-y divide-gray-100 -m-5">
      {commits.map(c => (
        <div key={c.commitId} className="px-5 py-3">
          <p className="text-sm text-gray-800 font-medium">{c.comment}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(c.date).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

function WorkItemsTab({ workItems }: { workItems: { id: number, title: string, state: string, effort: number }[] }) {
  if (workItems.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No work items in this period.</p>
  }
  return (
    <table className="w-full -m-5" style={{ width: 'calc(100% + 2.5rem)' }}>
      <thead>
        <tr className="bg-gray-50">
          <th className="text-left px-5 py-2 text-xs text-gray-500">ID</th>
          <th className="text-left px-5 py-2 text-xs text-gray-500">Title</th>
          <th className="text-center px-5 py-2 text-xs text-gray-500">State</th>
          <th className="text-center px-5 py-2 text-xs text-gray-500">Effort</th>
        </tr>
      </thead>
      <tbody>
        {workItems.map(wi => (
          <tr key={wi.id} className="border-t border-gray-100">
            <td className="px-5 py-2 text-sm text-gray-500">#{wi.id}</td>
            <td className="px-5 py-2 text-sm text-gray-800">{wi.title}</td>
            <td className="px-5 py-2 text-center">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">{wi.state}</span>
            </td>
            <td className={`px-5 py-2 text-center text-sm tabular-nums ${wi.effort < 1 || wi.effort > 3 ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
              {wi.effort ? `${wi.effort}h` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PrsTab({ prs }: { prs: { pullRequestId: number, title: string, status: string }[] }) {
  if (prs.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No pull requests in this period.</p>
  }
  return (
    <div className="divide-y divide-gray-100 -m-5">
      {prs.map(pr => (
        <div key={pr.pullRequestId} className="px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-800">{pr.title}</p>
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">{pr.status}</span>
        </div>
      ))}
    </div>
  )
}

function EffortByDayTab({ workItems }: { workItems: { changedDate: string, effort: number }[] }) {
  const grouped = new Map<string, number>()

  for (const wi of workItems) {
    if (!wi.changedDate) continue
    const dateKey = new Date(wi.changedDate).toISOString().split('T')[0]
    grouped.set(dateKey, (grouped.get(dateKey) || 0) + wi.effort)
  }

  const rows = Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, hours]) => ({
      date,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      hours,
    }))

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No effort data available for this period.</p>
  }

  return (
    <table className="w-full -m-5" style={{ width: 'calc(100% + 2.5rem)' }}>
      <thead>
        <tr className="bg-gray-50">
          <th className="text-left px-5 py-2 text-xs text-gray-500">Date</th>
          <th className="text-left px-5 py-2 text-xs text-gray-500">Day</th>
          <th className="text-center px-5 py-2 text-xs text-gray-500">Hours Worked</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.date} className="border-t border-gray-100">
            <td className="px-5 py-2 text-sm text-gray-800">{r.date}</td>
            <td className="px-5 py-2 text-sm text-gray-600">{r.day}</td>
            <td className={`px-5 py-2 text-center text-sm tabular-nums font-medium ${r.hours === 0 ? 'text-red-500' : 'text-gray-800'}`}>
              {r.hours.toFixed(1)}h
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
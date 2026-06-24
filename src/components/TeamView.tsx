import { useEffect, useState } from 'react'
import { fetchProjectContributors } from '../api/adoApi'
import type { Contributor } from '../api/adoApi'
import { detectAnomalies } from '../anomaly/detector'
import type { AnomalyResult } from '../anomaly/detector'
import type { Developer } from '../types'

interface Props {
  onSelectDeveloper: (dev: Developer) => void
  dateRange:         'today' | 'week' | 'month'
}

interface Row {
  contributor: Contributor
  anomaly:     AnomalyResult
}

export default function TeamView({ onSelectDeveloper, dateRange }: Props) {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    loadTeam()
  }, [dateRange])

  async function loadTeam() {
    setLoading(true)
    setError(null)

    try {
      const contributors = await fetchProjectContributors(dateRange)
      const built: Row[] = contributors.map(c => ({
        contributor: c,
        anomaly:     detectAnomalies(c, dateRange),
      }))
      // Sort: anomalies first, then by commit count descending
      built.sort((a, b) => {
        if (a.anomaly.hasAnomaly !== b.anomaly.hasAnomaly) {
          return a.anomaly.hasAnomaly ? -1 : 1
        }
        return b.contributor.commits.length - a.contributor.commits.length
      })
      setRows(built)
    } catch {
      setError('Failed to load team data. Check your ADO connection.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={loadTeam} className="mt-3 text-sm text-red-500 underline">
          Retry
        </button>
      </div>
    )
  }

  const anomalyCount  = rows.filter(r => r.anomaly.hasAnomaly).length
  const totalCommits  = rows.reduce((sum, r) => sum + r.contributor.commits.length, 0)

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Contributors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Anomalies Detected</p>
          <p className={`text-2xl font-bold mt-1 ${anomalyCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {anomalyCount}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Commits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCommits}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left   px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-2/5">Developer</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commits</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PRs</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Work Items</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Effort (hrs)</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.contributor.key}
                onClick={() => onSelectDeveloper({
                  id:    row.contributor.key,
                  name:  row.contributor.displayName,
                  email: row.contributor.email,
                })}
                className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors
                  ${row.anomaly.hasAnomaly ? 'bg-red-50' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {row.contributor.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{row.contributor.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{row.contributor.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold text-sm tabular-nums ${row.contributor.commits.length === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {row.contributor.commits.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-sm tabular-nums text-gray-900">
                    {row.contributor.prs.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-sm tabular-nums text-gray-900">
                    {row.contributor.workItems.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold text-sm tabular-nums ${row.contributor.totalEffortHours === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {row.contributor.totalEffortHours.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.anomaly.hasAnomaly ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      🔴 {row.anomaly.items.length} issue{row.anomaly.items.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      ✅ Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
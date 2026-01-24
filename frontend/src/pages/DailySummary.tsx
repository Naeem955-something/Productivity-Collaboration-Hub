import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailySummaryService, DailySummary } from '../services/dataService'
import { useMemo } from 'react'

export default function DailySummaryPage() {
  const queryClient = useQueryClient()

  const { data: summaries, isLoading } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: () => dailySummaryService.latest(10)
  })

  const runMutation = useMutation({
    mutationFn: () => dailySummaryService.runNow(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
  })

  const latest = useMemo(() => (summaries || [])[0], [summaries])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-400">Daily Summary</div>
          <div className="text-2xl font-semibold">Auto-generated recaps</div>
          <div className="text-xs text-slate-500">Completed, pending, deadlines, and activity</div>
        </div>
        <button className="btn-primary" onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
          {runMutation.isPending ? 'Generating...' : 'Run now'}
        </button>
      </div>

      {latest ? (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-slate-400">Latest</div>
              <div className="text-lg font-semibold">{latest.title}</div>
              <div className="text-xs text-slate-500">{new Date(latest.createdAt).toLocaleString()}</div>
            </div>
            <span className="badge">Live</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Metric label="Completed (24h)" value={latest.completedLast24h} />
            <Metric label="New tasks (24h)" value={latest.newTasksLast24h} />
            <Metric label="Pending" value={latest.pendingTasks} />
            <Metric label="Due soon" value={latest.upcomingDeadlines} />
            <Metric label="Activity" value={latest.activityCount} />
          </div>
          <div className="mt-4 text-sm text-slate-200">{latest.content}</div>
        </div>
      ) : (
        <div className="card p-4 text-slate-500">No summaries yet.</div>
      )}

      <div className="card p-4">
        <div className="font-semibold mb-3">History</div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {(summaries || []).map((item: DailySummary) => (
            <div key={item.id} className="border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{item.content}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs text-slate-400">
                <span>✅ Completed: {item.completedLast24h}</span>
                <span>🆕 New: {item.newTasksLast24h}</span>
                <span>📌 Pending: {item.pendingTasks}</span>
                <span>⏰ Due soon: {item.upcomingDeadlines}</span>
                <span>📈 Activity: {item.activityCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-lg bg-white/5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

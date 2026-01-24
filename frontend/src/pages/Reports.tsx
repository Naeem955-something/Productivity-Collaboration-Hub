import { useState } from 'react'
import { exportService } from '../services/dataService'

export default function ReportsPage() {
  const [projectId, setProjectId] = useState('')
  const [downloading, setDownloading] = useState<'board' | 'project' | null>(null)

  const handleDownload = async (type: 'board' | 'project') => {
    if (!projectId) return
    try {
      setDownloading(type)
      const id = Number(projectId)
      const blob = type === 'board'
        ? await exportService.downloadBoardCsv(id)
        : await exportService.downloadProjectSummary(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = type === 'board' ? `board-${id}.csv` : `project-${id}-summary.md`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-400">Export & Reporting</div>
          <div className="text-2xl font-semibold">Share boards and summaries</div>
          <div className="text-xs text-slate-500">Download CSV for Kanban and Markdown project reports.</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-3">Choose project</div>
        <div className="flex gap-2 flex-wrap">
          <input
            className="input"
            placeholder="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <button className="btn-primary" disabled={!projectId || downloading === 'board'} onClick={() => handleDownload('board')}>
            {downloading === 'board' ? 'Exporting...' : 'Export board CSV'}
          </button>
          <button className="btn-ghost" disabled={!projectId || downloading === 'project'} onClick={() => handleDownload('project')}>
            {downloading === 'project' ? 'Generating...' : 'Export project summary'}
          </button>
        </div>
        <div className="text-xs text-slate-500 mt-2">Tip: use the Project ID from the Projects page.</div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <InfoCard title="Board CSV" description="Includes id, title, status, priority, due date." />
        <InfoCard title="Project summary" description="Markdown with project info and tasks by status." />
      </div>
    </div>
  )
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card p-4">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{description}</div>
    </div>
  )
}

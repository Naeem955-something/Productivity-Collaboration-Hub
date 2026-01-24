import { useState } from 'react' // React hook to manage component state
import { exportService } from '../services/dataService' // Service to call backend API for exporting reports

export default function ReportsPage() {
  // State to hold project ID input
  const [projectId, setProjectId] = useState('')

  // State to track which type of export is currently in progress
  const [downloading, setDownloading] = useState<'board' | 'project' | null>(null)

  /**
   * handleDownload
   * - Handles the export/download of either a Kanban board CSV or a full project summary
   * - type: 'board' for Kanban CSV, 'project' for Markdown summary
   */
  const handleDownload = async (type: 'board' | 'project') => {
    if (!projectId) return // Do nothing if no project ID is entered

    try {
      setDownloading(type) // Show loading state for the button

      const id = Number(projectId) // Convert input to number
      // Call backend via exportService depending on type
      const blob = type === 'board'
        ? await exportService.downloadBoardCsv(id) // Download Kanban board CSV
        : await exportService.downloadProjectSummary(id) // Download project summary Markdown

      // Create a temporary link to trigger browser download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = type === 'board' ? `board-${id}.csv` : `project-${id}-summary.md`
      document.body.appendChild(link)
      link.click() // Trigger download
      link.remove() // Remove temporary link
      window.URL.revokeObjectURL(url) // Release memory
    } finally {
      setDownloading(null) // Reset loading state
    }
  }

  // JSX rendering of page
  return (
    <div className="space-y-4">

      {/* Header section with page title and description */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-400">Export & Reporting</div>
          <div className="text-2xl font-semibold">Share boards and summaries</div>
          <div className="text-xs text-slate-500">Download CSV for Kanban and Markdown project reports.</div>
        </div>
      </div>

      {/* Project selection card */}
      <div className="card p-4">
        <div className="font-semibold mb-3">Choose project</div>

        <div className="flex gap-2 flex-wrap">
          {/* Input for Project ID */}
          <input
            className="input"
            placeholder="Project ID"
            value={projectId} // Bound to state
            onChange={(e) => setProjectId(e.target.value)} // Update state on change
          />

          {/* Button to download board CSV */}
          <button 
            className="btn-primary" 
            disabled={!projectId || downloading === 'board'} // Disable if no project ID or download in progress
            onClick={() => handleDownload('board')} // Trigger download
          >
            {downloading === 'board' ? 'Exporting...' : 'Export board CSV'} {/* Show loading */}
          </button>

          {/* Button to download project summary */}
          <button 
            className="btn-ghost" 
            disabled={!projectId || downloading === 'project'} 
            onClick={() => handleDownload('project')}
          >
            {downloading === 'project' ? 'Generating...' : 'Export project summary'}
          </button>
        </div>

        {/* Tip below input */}
        <div className="text-xs text-slate-500 mt-2">Tip: use the Project ID from the Projects page.</div>
      </div>

      {/* Info cards explaining what each export includes */}
      <div className="grid md:grid-cols-2 gap-3">
        <InfoCard title="Board CSV" description="Includes id, title, status, priority, due date." />
        <InfoCard title="Project summary" description="Markdown with project info and tasks by status." />
      </div>
    </div>
  )
}

/**
 * InfoCard
 * Simple reusable card to display info about export types
 */
function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card p-4">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{description}</div>
    </div>
  )
}

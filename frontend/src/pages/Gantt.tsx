import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/dataService'
import { useSearchParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Task {
  id: number
  title: string
  startDate?: string
  dueDate?: string
  status: string
  priority: string
  assignee?: string
}

export default function Gantt() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getByProject(Number(projectId)),
    enabled: !!projectId
  })

  // Filter tasks that have dates
  const tasksWithDates = tasks.filter((task: Task) => task.startDate || task.dueDate)

  // Calculate timeline range
  const getTimelineRange = () => {
    if (tasksWithDates.length === 0) {
      const start = new Date(currentDate)
      start.setDate(1)
      const end = new Date(currentDate)
      end.setMonth(end.getMonth() + 3)
      return { start, end }
    }

    const dates = tasksWithDates.flatMap((t: Task) => [
      t.startDate ? new Date(t.startDate) : null,
      t.dueDate ? new Date(t.dueDate) : null
    ]).filter(Boolean) as Date[]

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    // Add padding
    minDate.setDate(minDate.getDate() - 7)
    maxDate.setDate(maxDate.getDate() + 7)

    return { start: minDate, end: maxDate }
  }

  const { start: timelineStart, end: timelineEnd } = getTimelineRange()
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))

  // Generate timeline columns
  const generateTimeline = () => {
    const columns = []
    const current = new Date(timelineStart)

    if (viewMode === 'day') {
      for (let i = 0; i < Math.min(totalDays, 60); i++) {
        columns.push({
          label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: new Date(current)
        })
        current.setDate(current.getDate() + 1)
      }
    } else if (viewMode === 'week') {
      for (let i = 0; i < Math.min(Math.ceil(totalDays / 7), 24); i++) {
        columns.push({
          label: `Week ${i + 1}`,
          date: new Date(current)
        })
        current.setDate(current.getDate() + 7)
      }
    } else {
      for (let i = 0; i < 12; i++) {
        columns.push({
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          date: new Date(current)
        })
        current.setMonth(current.getMonth() + 1)
      }
    }

    return columns
  }

  const timelineColumns = generateTimeline()

  // Calculate task bar position and width
  const getTaskBarStyle = (task: Task) => {
    const startDate = task.startDate || task.dueDate
    const endDate = task.dueDate || task.startDate
    
    if (!startDate || !endDate) return { left: '0%', width: '0%' }
    
    const start = new Date(startDate)
    const end = new Date(endDate)

    const startDiff = Math.max(0, (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const columnWidth = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30
    const left = (startDiff / columnWidth) * 100
    const width = (duration / columnWidth) * 100

    return { left: `${left}%`, width: `${width}%` }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  if (!projectId) {
    return (
      <div className="card p-8 text-center">
        <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-400">Please select a project to view its timeline</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">Project Timeline</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'day' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'month' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Month
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date())} className="btn-ghost text-sm">
              Today
            </button>
          </div>
        </div>
      </div>

      {tasksWithDates.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Timeline Data</h3>
          <p className="text-slate-400 mb-4">Add start and due dates to your tasks to see them on the timeline</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div ref={containerRef} className="overflow-x-auto">
            {/* Timeline Header */}
            <div className="flex border-b border-white/10 bg-slate-900/50 sticky top-0 z-10">
              <div className="min-w-[200px] w-[200px] p-4 border-r border-white/10 font-semibold">
                Tasks
              </div>
              <div className="flex-1 flex min-w-[800px]">
                {timelineColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex-1 p-2 text-center text-xs text-slate-400 border-r border-white/10"
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Body */}
            <div>
              {tasksWithDates.map((task: Task) => (
                <div key={task.id} className="flex border-b border-white/10 hover:bg-white/5 transition">
                  {/* Task Name */}
                  <div className="min-w-[200px] w-[200px] p-4 border-r border-white/10">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className={`px-1.5 py-0.5 rounded ${
                        task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </div>
                  </div>

                  {/* Task Bar */}
                  <div className="flex-1 relative min-w-[800px] p-2">
                    <div className="relative h-8">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex">
                        {timelineColumns.map((_, idx) => (
                          <div key={idx} className="flex-1 border-r border-white/5"></div>
                        ))}
                      </div>

                      {/* Task Bar */}
                      <div
                        className={`absolute top-1 h-6 rounded ${getPriorityColor(task.priority)} opacity-80 hover:opacity-100 transition cursor-pointer group`}
                        style={getTaskBarStyle(task)}
                      >
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs font-medium text-white truncate">{task.title}</span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-slate-900 border border-white/10 rounded p-2 text-xs whitespace-nowrap z-20 shadow-lg">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-slate-400 mt-1">
                            {task.startDate && new Date(task.startDate).toLocaleDateString()} 
                            {task.startDate && task.dueDate && ' → '}
                            {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-white/10 p-4 bg-slate-900/50">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-slate-400">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-slate-400">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-slate-400">Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

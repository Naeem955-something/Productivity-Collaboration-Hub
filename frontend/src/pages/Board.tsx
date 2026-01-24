import TaskCard from '../components/TaskCard'
import TaskColumn from '../components/TaskColumn'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/dataService'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Draggable Task Card Component
function DraggableTaskCard({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        title={task.title}
        desc={task.description}
        due={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined}
        tags={[task.priority, task.status]}
      />
    </div>
  )
}

export default function Board() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', startDate: '' })
  const [activeTask, setActiveTask] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => projectId ? taskService.getByProject(parseInt(projectId)) : Promise.resolve([]),
    enabled: !!projectId
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => taskService.create({ ...data, projectId: parseInt(projectId || '0') }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setShowModal(false)
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', startDate: '' })
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...formData, status: 'TODO' })
  }

  const tasksByStatus = {
    TODO: tasks?.filter((t: any) => t.status === 'TODO') || [],
    IN_PROGRESS: tasks?.filter((t: any) => t.status === 'IN_PROGRESS') || [],
    REVIEW: tasks?.filter((t: any) => t.status === 'REVIEW') || [],
    DONE: tasks?.filter((t: any) => t.status === 'DONE') || []
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks?.find((t: any) => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks?.find((t: any) => t.id === active.id)
    if (!activeTask) return

    // Determine the new status based on which column it was dropped into
    let newStatus = activeTask.status
    
    // Check if dropped over a column
    const overColumn = over.id
    if (typeof overColumn === 'string') {
      newStatus = overColumn
    } else {
      // Dropped over another task, find which column that task is in
      const overTask = tasks?.find((t: any) => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Only update if status changed
    if (newStatus !== activeTask.status) {
      updateTaskMutation.mutate({
        id: activeTask.id,
        data: { ...activeTask, status: newStatus }
      })
    }
  }

  if (!projectId) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-400">Please select a project to view its task board</p>
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
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Kanban board</div>
          <div className="text-2xl font-semibold">Project Tasks</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Add task</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
          {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((status) => (
            <div key={status} className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {status === 'TODO' ? 'To Do' : 
                   status === 'IN_PROGRESS' ? 'In Progress' : 
                   status === 'REVIEW' ? 'Review' : 'Done'}
                </h3>
                <span className="text-sm text-slate-400">{tasksByStatus[status].length}</span>
              </div>
              <SortableContext
                items={tasksByStatus[status].map((t: any) => t.id)}
                strategy={verticalListSortingStrategy}
                id={status}
              >
                <div className="space-y-3 min-h-[200px]" data-column={status}>
                  {tasksByStatus[status].map((task: any) => (
                    <DraggableTaskCard key={task.id} task={task} />
                  ))}
                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-white/10 rounded-lg">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80">
              <TaskCard
                title={activeTask.title}
                desc={activeTask.description}
                due={activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : undefined}
                tags={[activeTask.priority, activeTask.status]}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-primary w-full"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="input-primary w-full"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost flex-1"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

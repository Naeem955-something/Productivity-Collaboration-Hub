import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/dataService'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  CalendarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  FolderIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE', startDate: '', endDate: '' })

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(Number(id)),
    enabled: !!id
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => projectService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowEditModal(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/app/projects')
    }
  })

  const handleEdit = () => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status || 'ACTIVE',
        startDate: project.startDate || '',
        endDate: project.endDate || ''
      })
      setShowEditModal(true)
    }
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12 card">
        <p className="text-slate-400">Project not found</p>
      </div>
    )
  }

  const taskCount = 0 // Would come from backend
  const documentCount = 0
  const fileCount = 0
  const memberCount = 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/app/projects')} className="text-primary text-sm mb-2 hover:underline">
            ← Back to Projects
          </button>
          <div className="text-2xl font-semibold">{project.name}</div>
          <div className="text-slate-400 text-sm mt-1">{project.description}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEdit} className="btn-ghost flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button onClick={handleDelete} className="btn-ghost text-red-400 hover:bg-red-500/10 flex items-center gap-2">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{taskCount}</div>
              <div className="text-sm text-slate-400">Tasks</div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{memberCount}</div>
              <div className="text-sm text-slate-400">Members</div>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{documentCount}</div>
              <div className="text-sm text-slate-400">Documents</div>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{fileCount}</div>
              <div className="text-sm text-slate-400">Files</div>
            </div>
            <FolderIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="font-semibold text-lg mb-4">Project Information</div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-sm ${
                  project.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'ON_HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Start Date</span>
                <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">End Date</span>
                <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Created</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <div className="font-semibold text-lg mb-4">Quick Actions</div>
            <div className="grid md:grid-cols-3 gap-3">
              <button 
                onClick={() => navigate(`/app/board?projectId=${project.id}`)}
                className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition text-left"
              >
                <CheckCircleIcon className="w-6 h-6 text-primary mb-2" />
                <div className="font-medium">Kanban Board</div>
                <div className="text-xs text-slate-400">Manage tasks</div>
              </button>
              <button 
                onClick={() => navigate(`/app/gantt?projectId=${project.id}`)}
                className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition text-left"
              >
                <CalendarIcon className="w-6 h-6 text-blue-500 mb-2" />
                <div className="font-medium">Gantt Chart</div>
                <div className="text-xs text-slate-400">Timeline view</div>
              </button>
              <button 
                onClick={() => navigate(`/app/documents?projectId=${project.id}`)}
                className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition text-left"
              >
                <DocumentTextIcon className="w-6 h-6 text-green-500 mb-2" />
                <div className="font-medium">Documents</div>
                <div className="text-xs text-slate-400">Collaboration</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <div className="font-semibold text-lg mb-4">Recent Activity</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                <div className="flex-1">
                  <div className="font-medium">Project created</div>
                  <div className="text-sm text-slate-400">{new Date(project.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-center py-8 text-slate-400 text-sm">
                No recent activity
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Team Members</div>
              <button className="btn-ghost text-sm">+ Add</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                  U
                </div>
                <div className="flex-1">
                  <div className="font-medium">Project Owner</div>
                  <div className="text-xs text-slate-400">Admin</div>
                </div>
              </div>
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-white/10 rounded-lg">
                No additional members yet
              </div>
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="card p-6 mt-6">
            <div className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Timeline
            </div>
            {project.startDate && project.endDate ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Progress</div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">45% complete</div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Duration</span>
                    <span>
                      {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Set start and end dates to see timeline
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-primary w-full"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="input-primary w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
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
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-ghost flex-1"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

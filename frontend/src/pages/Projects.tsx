import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/dataService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Projects() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll
  })

  const createMutation = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowModal(false)
      setFormData({ name: '', description: '' })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
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
          <div className="text-sm text-slate-400">Project portfolio</div>
          <div className="text-2xl font-semibold">All projects</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>New project</button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <div 
              key={project.id} 
              className="card p-4 space-y-3 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold cursor-pointer hover:text-primary transition" onClick={() => navigate(`/app/projects/${project.id}`)}>
                  {project.name}
                </div>
                <span className="badge">{project.status || 'Active'}</span>
              </div>
              <div className="text-sm text-slate-400 line-clamp-2">{project.description}</div>
              <div className="text-sm text-slate-400">{project.memberCount || 0} members collaborating</div>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => navigate(`/app/board?projectId=${project.id}`)}
                  className="badge hover:bg-primary/20 cursor-pointer transition"
                >
                  Kanban
                </button>
                <button 
                  onClick={() => navigate(`/app/gantt?projectId=${project.id}`)}
                  className="badge hover:bg-blue-500/20 cursor-pointer transition"
                >
                  Gantt
                </button>
                <button 
                  onClick={() => navigate(`/app/documents?projectId=${project.id}`)}
                  className="badge hover:bg-green-500/20 cursor-pointer transition"
                >
                  Docs
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-slate-400">No projects yet. Create your first project to get started!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Enter project name"
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
                  placeholder="Enter project description"
                />
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
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

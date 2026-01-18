import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalService } from '../services/dataService'
import { useState } from 'react'

export default function Goals() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', targetValue: 100, currentValue: 0 })

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getByUser
  })

  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setShowModal(false)
      setFormData({ title: '', description: '', targetValue: 100, currentValue: 0 })
    }
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: number; progress: number }) => 
      goalService.updateProgress(id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleUpdateProgress = (goalId: number, currentProgress: number) => {
    const newProgress = prompt(`Update progress (current: ${currentProgress}):`, currentProgress.toString())
    if (newProgress !== null) {
      updateProgressMutation.mutate({ id: goalId, progress: parseFloat(newProgress) })
    }
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
          <div className="text-sm text-slate-400">Goals & habits</div>
          <div className="text-2xl font-semibold">Track progress</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Create goal</button>
      </div>
      {goals && goals.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {goals.map((goal: any) => {
            const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
            return (
              <div key={goal.id} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{goal.title}</div>
                    <div className="text-xs text-slate-400">{goal.description}</div>
                  </div>
                  <span className="badge">{goal.status}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-emerald-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="text-sm text-slate-300">
                  Progress: {goal.currentValue} / {goal.targetValue} ({Math.round(progress)}%)
                </div>
                <button 
                  className="btn-ghost w-full"
                  onClick={() => handleUpdateProgress(goal.id, goal.currentValue)}
                  disabled={updateProgressMutation.isPending}
                >
                  Update progress
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-slate-400">No goals yet. Create your first goal to start tracking progress!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Enter goal title"
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
                  placeholder="Enter goal description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Value</label>
                <input
                  type="number"
                  required
                  value={formData.targetValue}
                  onChange={e => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                  className="input-primary w-full"
                  placeholder="Enter target value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Value</label>
                <input
                  type="number"
                  required
                  value={formData.currentValue}
                  onChange={e => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                  className="input-primary w-full"
                  placeholder="Enter current value"
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
                  {createMutation.isPending ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

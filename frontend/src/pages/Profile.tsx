import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/dataService'
import { CameraIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    avatarUrl: user?.avatarUrl || ''
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => user ? userService.getUserStats(user.id) : Promise.resolve(null),
    enabled: !!user?.id
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => userService.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      setIsEditing(false)
      alert('Profile updated successfully!')
    },
    onError: () => {
      alert('Failed to update profile')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      title: user?.title || '',
      avatarUrl: user?.avatarUrl || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-400">User Profile</div>
        <div className="text-2xl font-semibold">My Profile & Activity</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:bg-primary/80">
                  <CameraIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center mt-4">
                <div className="text-xl font-semibold">{user.name}</div>
                <div className="text-slate-400">{user.title || 'No title set'}</div>
                <div className="text-sm text-slate-500 mt-1">{user.email}</div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Role</span>
                <span className={`px-2 py-0.5 rounded text-sm ${
                  user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400">● Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Profile Info */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Profile Information</div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Full Name</label>
                  <input 
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Job Title</label>
                  <input 
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Full Name</span>
                  <span>{user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Job Title</span>
                  <span>{user.title || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Statistics */}
          <div className="card p-6">
            <div className="font-semibold text-lg mb-4">Activity Statistics</div>
            {statsLoading ? (
              <div className="text-slate-400">Loading stats...</div>
            ) : stats ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-primary">{stats.tasksAssigned || 0}</div>
                  <div className="text-sm text-slate-400 mt-1">Tasks Assigned</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-green-500">{stats.tasksCompleted || 0}</div>
                  <div className="text-sm text-slate-400 mt-1">Tasks Completed</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-blue-500">{stats.activityCount || 0}</div>
                  <div className="text-sm text-slate-400 mt-1">Total Activities</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400">No statistics available</div>
            )}
          </div>

          {/* Contribution Overview */}
          <div className="card p-6">
            <div className="font-semibold text-lg mb-4">Recent Contributions</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="font-medium">Completed task: Design Review</div>
                  <div className="text-sm text-slate-400">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="font-medium">Commented on: API Implementation</div>
                  <div className="text-sm text-slate-400">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <div className="font-medium">Created project: Mobile App Redesign</div>
                  <div className="text-sm text-slate-400">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

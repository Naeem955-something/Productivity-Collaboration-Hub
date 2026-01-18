import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { userService } from '../services/dataService'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    deadlineAlerts: true,
    dailySummary: true,
    taskAssignments: true,
    chatMessages: false
  })
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(user!.id, data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSuccess(true)
      setTimeout(() => setShowPasswordSuccess(false), 3000)
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to change password')
    }
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-400">Settings</div>
        <div className="text-2xl font-semibold">Account & Preferences</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-lg">Account Information</div>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Name</label>
              <div className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                {user?.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Email</label>
              <div className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                {user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Role</label>
              <div className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-sm ${
                  user?.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/app/profile')}
              className="btn-ghost w-full mt-4"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-lg">Change Password</div>
          {showPasswordSuccess && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Password changed successfully!
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Current Password</label>
              <input 
                type="password"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">New Password</label>
              <input 
                type="password"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Confirm New Password</label>
              <input 
                type="password"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-lg">Notification Preferences</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <div className="font-semibold text-sm">Deadline Alerts</div>
                <div className="text-xs text-slate-400">Receive reminders 24h before due</div>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.deadlineAlerts}
                onChange={e => setPreferences({ ...preferences, deadlineAlerts: e.target.checked })}
                className="h-5 w-5 accent-primary cursor-pointer" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <div className="font-semibold text-sm">Daily Summary</div>
                <div className="text-xs text-slate-400">Morning digest at 7 AM</div>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.dailySummary}
                onChange={e => setPreferences({ ...preferences, dailySummary: e.target.checked })}
                className="h-5 w-5 accent-primary cursor-pointer" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <div className="font-semibold text-sm">Task Assignments</div>
                <div className="text-xs text-slate-400">When you're assigned to a task</div>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.taskAssignments}
                onChange={e => setPreferences({ ...preferences, taskAssignments: e.target.checked })}
                className="h-5 w-5 accent-primary cursor-pointer" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <div className="font-semibold text-sm">Chat Messages</div>
                <div className="text-xs text-slate-400">Notifications for team chats</div>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.chatMessages}
                onChange={e => setPreferences({ ...preferences, chatMessages: e.target.checked })}
                className="h-5 w-5 accent-primary cursor-pointer" 
              />
            </div>
          </div>
          <button className="btn-ghost w-full">Save Preferences</button>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 space-y-4">
          <div className="font-semibold text-lg text-red-400">Danger Zone</div>
          <div className="space-y-3">
            <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
              <div className="font-semibold text-sm mb-1">Logout</div>
              <div className="text-xs text-slate-400 mb-3">Sign out from your account</div>
              <button 
                onClick={handleLogout}
                className="btn-ghost w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Sign Out
              </button>
            </div>
            <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
              <div className="font-semibold text-sm mb-1">Delete Account</div>
              <div className="text-xs text-slate-400 mb-3">Permanently delete your account and data</div>
              <button 
                onClick={() => alert('Account deletion feature coming soon')}
                className="btn-ghost w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

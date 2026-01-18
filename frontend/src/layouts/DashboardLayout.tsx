import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BellIcon, ChartBarIcon, ChatBubbleLeftIcon, Cog6ToothIcon, DocumentTextIcon, FolderIcon, HomeIcon, RectangleStackIcon, Squares2X2Icon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { notificationService, Notification } from '../services/dataService'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: HomeIcon, group: 'main' },
  { to: '/app/notifications', label: 'Notifications', icon: BellIcon, group: 'main' },
  { to: '/app/projects', label: 'Projects', icon: RectangleStackIcon, group: 'main' },
  { to: '/app/board', label: 'Board', icon: Squares2X2Icon, group: 'main' },
  { to: '/app/files', label: 'Files', icon: FolderIcon, group: 'main' },
  { to: '/app/documents', label: 'Docs', icon: DocumentTextIcon, group: 'collab' },
  { to: '/app/chat', label: 'Chat', icon: ChatBubbleLeftIcon, group: 'collab' },
  { to: '/app/goals', label: 'Goals', icon: ChartBarIcon, group: 'track' },
  { to: '/app/analytics', label: 'Analytics', icon: ChartBarIcon, group: 'track' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationPreview, setNotificationPreview] = useState<Notification[]>([])
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch unread notifications on mount and periodic refresh
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const loadNotifications = async () => {
    try {
      const [count, recent] = await Promise.all([
        notificationService.unreadCount(user!.id),
        notificationService.getRecent(user!.id, 5)
      ])
      setUnreadCount(count)
      setNotificationPreview(recent)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    try {
      await notificationService.markAllRead(user.id)
      await loadNotifications()
    } catch (error) {
      console.error('Failed to mark notifications as read', error)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
  }

  const groupedNavItems = {
    main: navItems.filter(item => item.group === 'main'),
    collab: navItems.filter(item => item.group === 'collab'),
    track: navItems.filter(item => item.group === 'track'),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-slate-950 to-surface text-slate-100 flex">
      {/* Sidebar */}
      <aside className={clsx('transition-all duration-300 border-r border-white/5 backdrop-blur bg-slate-900/40 flex flex-col', sidebarOpen ? 'w-64' : 'w-20')}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
            <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-extrabold">PH</div>
            {sidebarOpen && <div className="leading-tight"><div className="font-semibold text-sm">Productivity Hub</div><div className="text-xs text-slate-400">Innovision Dynamics</div></div>}
          </div>
          <button className="btn-ghost p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main */}
          <div>
            {sidebarOpen && <div className="text-xs font-semibold text-slate-400 px-3 mb-2">WORKSPACE</div>}
            <div className="space-y-1">
              {groupedNavItems.main.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium',
                    isActive ? 'bg-primary/20 text-white border border-primary/30 shadow-inner shadow-primary/20' : 'text-slate-300 hover:bg-white/5')}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Collaboration */}
          <div>
            {sidebarOpen && <div className="text-xs font-semibold text-slate-400 px-3 mb-2">COLLABORATION</div>}
            <div className="space-y-1">
              {groupedNavItems.collab.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium',
                    isActive ? 'bg-primary/20 text-white border border-primary/30 shadow-inner shadow-primary/20' : 'text-slate-300 hover:bg-white/5')}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div>
            {sidebarOpen && <div className="text-xs font-semibold text-slate-400 px-3 mb-2">TRACKING</div>}
            <div className="space-y-1">
              {groupedNavItems.track.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium',
                    isActive ? 'bg-primary/20 text-white border border-primary/30 shadow-inner shadow-primary/20' : 'text-slate-300 hover:bg-white/5')}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Settings & Logout */}
        <div className="border-t border-white/5 px-3 py-4 space-y-1">
          <NavLink
            to="/app/settings"
            className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium',
              isActive ? 'bg-primary/20 text-white border border-primary/30 shadow-inner shadow-primary/20' : 'text-slate-300 hover:bg-white/5')}
          >
            <Cog6ToothIcon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && 'Settings'}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-300 w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-white/5 backdrop-blur bg-slate-900/30 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-sm text-slate-400">Welcome back</div>
              <div className="text-xl font-semibold">{user?.name || 'User'}</div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationMenuRef}>
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="btn-ghost relative p-2"
                  title="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Notifications</div>
                        <button className="text-xs text-primary hover:underline" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                          Mark all read
                        </button>
                      </div>
                      {unreadCount === 0 && <div className="text-sm text-slate-400 mt-2">All caught up!</div>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationPreview.length === 0 ? (
                        <div className="p-4 text-sm text-slate-400 text-center">No notifications yet</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notificationPreview.map(item => (
                            <div key={item.id} className="p-3 flex gap-3 hover:bg-white/5">
                              <div className="h-2 w-2 mt-2 rounded-full" style={{ backgroundColor: item.readFlag ? '#475569' : '#38bdf8' }}></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{item.message}</div>
                                <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/5">
                      <button
                        className="btn-ghost w-full"
                        onClick={() => {
                          setNotificationMenuOpen(false)
                          navigate('/app/notifications')
                        }}
                      >
                        Open notification center
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  title="Profile menu"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user?.name)}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{user?.name || 'User'}</div>
                    <div className="text-xs text-slate-400">{user?.role}</div>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-white/5">
                      <div className="font-semibold">{user?.name}</div>
                      <div className="text-sm text-slate-400">{user?.email}</div>
                      <div className="text-xs text-slate-500 mt-1">Role: {user?.role}</div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          navigate('/app/profile')
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-sm transition flex items-center gap-2"
                      >
                        <UserCircleIcon className="h-4 w-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          navigate('/app/settings')
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-sm transition flex items-center gap-2"
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-300 text-sm transition flex items-center gap-2"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, Notification } from '../services/dataService'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user?.id,
    queryFn: () => notificationService.getAll(user!.id)
  })

  const unreadCount = useMemo(() => (notifications || []).filter(n => !n.readFlag).length, [notifications])

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  if (!user?.id) {
    return <div className="card p-6">Please log in to view notifications.</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const list = notifications || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Notification Center</div>
          <div className="text-2xl font-semibold">Stay on top of updates</div>
          <div className="text-xs text-slate-500">{unreadCount} unread • {list.length} total</div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost"
            disabled={markAllMutation.isPending || list.length === 0}
            onClick={() => markAllMutation.mutate()}
          >
            {markAllMutation.isPending ? 'Marking...' : 'Mark all read'}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {list.length === 0 && (
          <div className="card p-6 text-center text-slate-400">No notifications yet</div>
        )}

        {list.map((item: Notification) => (
          <div key={item.id} className="card p-4 flex gap-3 items-start border border-white/5">
            <div className={`h-3 w-3 rounded-full mt-1 ${item.readFlag ? 'bg-slate-600' : 'bg-primary'}`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{item.type}</div>
                <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm mt-1">{item.message}</div>
              {item.link && (
                <a href={item.link} className="text-xs text-primary hover:underline" target="_blank" rel="noreferrer">Open link</a>
              )}
            </div>
            {!item.readFlag && (
              <button
                className="btn-ghost text-xs"
                onClick={() => markReadMutation.mutate(item.id)}
                disabled={markReadMutation.isPending}
              >
                {markReadMutation.isPending ? '...' : 'Mark read'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

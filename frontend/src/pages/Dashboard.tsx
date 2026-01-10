import StatCard from '../components/StatCard'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const activity = [
  { name: 'Mon', tasks: 6 },
  { name: 'Tue', tasks: 9 },
  { name: 'Wed', tasks: 4 },
  { name: 'Thu', tasks: 11 },
  { name: 'Fri', tasks: 7 }
]

const feed = [
  { title: 'Design QA ready', time: '5m ago', actor: 'Sara', type: 'Task updated' },
  { title: 'Docs refreshed', time: '22m ago', actor: 'Liam', type: 'Document' },
  { title: 'Deadline reminder', time: '1h ago', actor: 'System', type: 'Automation' }
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 card p-5 flex items-center justify-between bg-gradient-to-r from-primary/15 via-primary/5 to-transparent">
          <div>
            <div className="text-sm text-slate-300">Good morning, Innovision</div>
            <div className="text-2xl font-semibold">Track progress, act fast, stay aligned.</div>
            <div className="text-sm text-slate-400 mt-2">Quick links: create task • start whiteboard • open notifications</div>
          </div>
          <button className="btn-primary">Create Task</button>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-400">Notifications</div>
          <div className="text-3xl font-semibold">8</div>
          <div className="text-xs text-primary mt-1">2 unread deadlines</div>
          <button className="btn-ghost mt-3 w-full">Open center</button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Tasks" value="128" hint="24 in progress" />
        <StatCard title="On-track" value="86%" hint="+4% vs last week" />
        <StatCard title="Focus hours saved" value="18h" hint="Automation & templates" />
        <StatCard title="Active projects" value="7" hint="3 at risk" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-400">Throughput</div>
              <div className="font-semibold">Tasks completed</div>
            </div>
            <span className="badge">This week</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity}>
                <XAxis dataKey="name" stroke="#475569" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="tasks" stroke="#60a5fa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Recent activity</div>
            <span className="badge">Live</span>
          </div>
          <div className="space-y-3">
            {feed.map(item => (
              <div key={item.title} className="border border-white/5 rounded-lg p-3 bg-white/5">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-slate-400">{item.actor} • {item.type}</div>
                <div className="text-xs text-slate-500">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

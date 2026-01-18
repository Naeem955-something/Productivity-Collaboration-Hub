import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const throughput = [
  { name: 'Jan', value: 68 },
  { name: 'Feb', value: 82 },
  { name: 'Mar', value: 95 },
  { name: 'Apr', value: 88 },
  { name: 'May', value: 110 }
]

const distribution = [
  { name: 'Engineering', value: 45 },
  { name: 'Product', value: 25 },
  { name: 'Design', value: 15 },
  { name: 'QA', value: 15 }
]

const colors = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa']

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Analytics</div>
          <div className="text-2xl font-semibold">Team performance</div>
        </div>
        <button className="btn-primary">Export report</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Throughput</div>
            <span className="badge">Tasks/month</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughput}>
                <XAxis dataKey="name" stroke="#475569" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Work distribution</div>
            <span className="badge">By team</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                  {distribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={colors[idx % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

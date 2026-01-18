import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/solid'

const highlights = [
  { icon: SparklesIcon, title: 'Unified workspace', body: 'Projects, tasks, files, and chat in one modern interface.' },
  { icon: ShieldCheckIcon, title: 'Secure by default', body: 'JWT auth, role-based access, and audited changes.' },
  { icon: BoltIcon, title: 'Real-time ready', body: 'WebSockets for chat, board sync, whiteboard, and alerts.' }
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-slate-950 to-surface text-slate-100">
      <header className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-extrabold">PH</div>
          <div>
            <div className="font-semibold">Productivity Hub</div>
            <div className="text-xs text-slate-400">Innovision Dynamics</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 badge text-primary border-primary/30">
              Live collaboration • Analytics • Automation
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Lead projects with clarity and collaborate in real time.
            </h1>
            <p className="text-lg text-slate-300 max-w-xl">
              Plan projects, track tasks, chat with your team, and ship faster with a cohesive workspace designed for high-performing teams.
            </p>
            <div className="flex gap-3">
              <Link to="/register" className="btn-primary">
                Create workspace <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/app" className="btn-ghost">View dashboard</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-4">
              {highlights.map(item => (
                <div key={item.title} className="card p-4 space-y-2">
                  <item.icon className="h-6 w-6 text-primary" />
                  <div className="font-semibold">{item.title}</div>
                  <p className="text-sm text-slate-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-white/5 to-primary/5 border-primary/10 shadow-2xl">
            <div className="text-sm text-slate-300 mb-4">Live project pulse</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-slate-400">On-time delivery</div>
                <div className="text-3xl font-semibold">92%</div>
                <div className="text-xs text-emerald-300 mt-1">+4% this month</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-slate-400">Focus time saved</div>
                <div className="text-3xl font-semibold">18h</div>
                <div className="text-xs text-primary mt-1">Automation wins</div>
              </div>
              <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Active sprints</div>
                  <span className="badge">3 teams</span>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Launchpad Revamp</span><span className="text-emerald-300">On track</span></div>
                  <div className="flex justify-between"><span>Mobile QA</span><span className="text-amber-200">At risk</span></div>
                  <div className="flex justify-between"><span>Docs refresh</span><span className="text-primary">Ahead</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-slate-900/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span>Built by Innovision Dynamics • Productivity & Collaboration Hub</span>
          <div className="flex gap-3">
            <a className="hover:text-primary" href="#">Privacy</a>
            <a className="hover:text-primary" href="#">Status</a>
            <a className="hover:text-primary" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

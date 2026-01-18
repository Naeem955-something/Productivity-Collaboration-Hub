import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await login(form.email, form.password)
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-6">
      <div className="w-full max-w-md bg-slate-900/50 border border-white/5 rounded-2xl p-8 shadow-xl space-y-6">
        <div>
          <div className="text-sm text-slate-400">Create your account</div>
          <div className="text-2xl font-semibold">Join Productivity Hub</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-primary outline-none"
            />
          </div>
          <button type="submit" className="btn-primary w-full">Create Account</button>
        </form>
        <div className="text-sm text-slate-400 text-center">
          Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
        </div>
      </div>
    </div>
  )
}

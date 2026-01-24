import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchService, SearchResults } from '../services/dataService'

export default function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ['search', submitted],
    queryFn: () => searchService.search(submitted),
    enabled: submitted.length > 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(keyword.trim())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-400">Smart Search</div>
          <div className="text-2xl font-semibold">Tasks, projects, docs, files</div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="input"
            placeholder="Search anything..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={!keyword.trim()}>
            {isFetching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {submitted.length === 0 && <div className="card p-4 text-slate-500">Type a keyword to search across the workspace.</div>}

      {submitted.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          <ResultCard title="Tasks" items={data?.tasks} render={(task: any) => `${task.title} • ${task.status}`} />
          <ResultCard title="Projects" items={data?.projects} render={(p: any) => `${p.name} • ${p.status || 'Active'}`} />
          <ResultCard title="Documents" items={data?.documents} render={(d: any) => `${d.title}`} />
          <ResultCard title="Files" items={data?.files} render={(f: any) => `${f.name} • ${Math.round((f.sizeInBytes || 0) / 1024)} KB`} />
        </div>
      )}
    </div>
  )
}

function ResultCard({ title, items, render }: { title: string; items?: any[]; render: (item: any) => string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <span className="badge">{items?.length ?? 0}</span>
      </div>
      {(!items || items.length === 0) && <div className="text-sm text-slate-500">No results</div>}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {items?.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-white/5 text-sm">{render(item)}</div>
        ))}
      </div>
    </div>
  )}
}

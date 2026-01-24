import { useState } from 'react' // React hook for managing component state
import { useQuery } from '@tanstack/react-query' // React Query for fetching and caching API data
import { searchService, SearchResults } from '../services/dataService' // Service for backend search API

// Main component for Smart Search page
export default function SearchPage() {
  // State to store what the user is typing in the search input
  const [keyword, setKeyword] = useState('')

  // State to store the submitted keyword (only triggers API call when submitted)
  const [submitted, setSubmitted] = useState('')

  // React Query hook to fetch search results from backend
  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ['search', submitted], // unique key per search term for caching
    queryFn: () => searchService.search(submitted), // calls backend API
    enabled: submitted.length > 0 // only fetch if a keyword has been submitted
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // prevent page reload
    setSubmitted(keyword.trim()) // set the keyword that triggers search
  }

  return (
    <div className="space-y-4">
      {/* Header Section: Title + Search Form */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-400">Smart Search</div>
          <div className="text-2xl font-semibold">Tasks, projects, docs, files</div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="input"
            placeholder="Search anything..." // Input placeholder
            value={keyword} // bind input to state
            onChange={(e) => setKeyword(e.target.value)} // update state on typing
          />
          <button className="btn-primary" type="submit" disabled={!keyword.trim()}>
            {isFetching ? 'Searching...' : 'Search'} {/* Show loading text while fetching */}
          </button>
        </form>
      </div>

      {/* Show this message when nothing is submitted yet */}
      {submitted.length === 0 && (
        <div className="card p-4 text-slate-500">
          Type a keyword to search across the workspace.
        </div>
      )}

      {/* Display results after submission */}
      {submitted.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Each result category has its own ResultCard */}
          <ResultCard
            title="Tasks"
            items={data?.tasks}
            render={(task: any) => `${task.title} • ${task.status}`} // how each task is displayed
          />
          <ResultCard
            title="Projects"
            items={data?.projects}
            render={(p: any) => `${p.name} • ${p.status || 'Active'}`}
          />
          <ResultCard
            title="Documents"
            items={data?.documents}
            render={(d: any) => `${d.title}`}
          />
          <ResultCard
            title="Files"
            items={data?.files}
            render={(f: any) => `${f.name} • ${Math.round((f.sizeInBytes || 0) / 1024)} KB`}
          />
        </div>
      )}
    </div>
  )
}

// Component to display a single category of search results
function ResultCard({ title, items, render }: { title: string; items?: any[]; render: (item: any) => string }) {
  return (
    <div className="card p-4">
      {/* Header: Category Title + Count */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <span className="badge">{items?.length ?? 0}</span> {/* Number of results */}
      </div>

      {/* Show message if no items found */}
      {(!items || items.length === 0) && (
        <div className="text-sm text-slate-500">No results</div>
      )}

      {/* List of items */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {items?.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-white/5 text-sm">
            {render(item)} {/* Render each item using the provided function */}
          </div>
        ))}
      </div>
    </div>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { DocumentTextIcon, PlusIcon, TrashIcon, ClockIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

interface Document {
  id: number
  title: string
  content: string
  version: number
  createdAt: string
  lastEditedBy?: string
  archived?: boolean
}

interface DocumentVersion {
  id: number
  versionNumber: number
  content: string
  editedBy?: string
  createdAt: string
  changeDescription?: string
}

export default function Documents() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState<number | null>(null)
  const [editingDocId, setEditingDocId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [formData, setFormData] = useState({ title: '', content: '' })

  // Fetch documents
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const res = await fetch(`http://localhost:8080/api/documents/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return res.json()
    },
    enabled: !!projectId
  })

  // Fetch document versions
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['documentVersions', showVersionHistory],
    queryFn: async () => {
      if (!showVersionHistory) return []
      const res = await fetch(`http://localhost:8080/api/documents/${showVersionHistory}/versions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return res.json()
    },
    enabled: !!showVersionHistory
  })

  // Create document
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`http://localhost:8080/api/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...data, projectId: parseInt(projectId || '0') })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
      setShowCreateModal(false)
      setFormData({ title: '', content: '' })
    }
  })

  // Update document
  const updateMutation = useMutation({
    mutationFn: async ({ docId, content }: { docId: number; content: string }) => {
      const res = await fetch(`http://localhost:8080/api/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, changeDescription: 'Updated content' })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
      setEditingDocId(null)
      setEditContent('')
    }
  })

  // Delete document
  const deleteMutation = useMutation({
    mutationFn: async (docId: number) => {
      const res = await fetch(`http://localhost:8080/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
    }
  })

  // Restore version
  const restoreMutation = useMutation({
    mutationFn: async ({ docId, versionNumber }: { docId: number; versionNumber: number }) => {
      const res = await fetch(`http://localhost:8080/api/documents/${docId}/restore/${versionNumber}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
      setShowVersionHistory(null)
    }
  })

  if (!projectId) {
    return (
      <div className="card p-8 text-center">
        <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-400">Select a project to view documents</p>
      </div>
    )
  }

  if (docsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Documents</div>
          <div className="text-slate-400 text-sm mt-1">Collaborate on shared documents</div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Document List */}
      {editingDocId ? (
        /* Document Editor */
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {documents.find((d: Document) => d.id === editingDocId)?.title}
            </h3>
            <button
              onClick={() => setEditingDocId(null)}
              className="btn-ghost text-sm"
            >
              Close
            </button>
          </div>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="Write your document content here..."
            className="input-primary w-full h-96 font-mono text-sm"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setEditingDocId(null)}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => updateMutation.mutate({ docId: editingDocId, content: editContent })}
              disabled={updateMutation.isPending}
              className="btn-primary flex-1"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setShowVersionHistory(editingDocId)}
              className="btn-ghost flex items-center gap-2"
            >
              <ClockIcon className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="card p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
          <p className="text-slate-400 mb-4">Create your first collaborative document</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc: Document) => (
            <div key={doc.id} className="card p-4 hover:border-primary/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer hover:text-primary" onClick={() => {
                  setEditingDocId(doc.id)
                  setEditContent(doc.content)
                }}>
                  <div className="font-semibold">{doc.title}</div>
                  <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {doc.content || 'Empty document'}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    v{doc.version} • {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setShowVersionHistory(doc.id)}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    <ClockIcon className="w-4 h-4" />
                    History
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this document?')) {
                        deleteMutation.mutate(doc.id)
                      }
                    }}
                    className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Document</h2>
            <form
              onSubmit={e => {
                e.preventDefault()
                createMutation.mutate(formData)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Document title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input-primary w-full"
                  rows={4}
                  placeholder="Start typing..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVersionHistory(null)}>
          <div className="card p-6 max-w-2xl w-full max-h-96 m-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Version History</h2>
              <button onClick={() => setShowVersionHistory(null)} className="btn-ghost text-sm">Close</button>
            </div>
            
            {versionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No versions available</div>
            ) : (
              <div className="space-y-3">
                {versions.map((version: DocumentVersion) => (
                  <div key={version.id} className="bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Version {version.versionNumber}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(version.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreMutation.mutate({
                          docId: showVersionHistory,
                          versionNumber: version.versionNumber
                        })}
                        disabled={restoreMutation.isPending}
                        className="btn-ghost text-sm flex items-center gap-1"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

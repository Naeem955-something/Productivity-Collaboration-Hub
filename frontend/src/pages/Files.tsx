
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fileService } from '../services/dataService'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDownIcon, TrashIcon, ArrowUpTrayIcon, ClockIcon } from '@heroicons/react/24/outline'

interface FileItem {
  id: number
  name: string
  contentType: string
  sizeInBytes: number
  createdAt: string
  uploadedBy?: { name: string }
}

interface FileVersion {
  id: number
  versionLabel: string
  sizeInBytes: number
  uploadedBy?: { name: string }
  createdAt: string
}

export default function Files() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [expandedFileId, setExpandedFileId] = useState<number | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState<number | null>(null)

  const { data: files, isLoading } = useQuery({
    queryKey: ['files', projectId],
    queryFn: () => projectId ? fileService.getByProject(parseInt(projectId)) : Promise.resolve([]),
    enabled: !!projectId
  })

  const { data: fileVersions } = useQuery({
    queryKey: ['fileVersions', showVersionHistory],
    queryFn: () => showVersionHistory ? fileService.getVersions(showVersionHistory) : Promise.resolve([]),
    enabled: !!showVersionHistory
  })

  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; projectId: number }) => fileService.upload(data.file, data.projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] })
      setUploading(false)
    },
    onError: () => {
      setUploading(false)
    }
  })

  const uploadVersionMutation = useMutation({
    mutationFn: (data: { file: File; fileId: number }) => fileService.uploadVersion(data.file, data.fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] })
      queryClient.invalidateQueries({ queryKey: ['fileVersions', showVersionHistory] })
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (data: { fileId: number; versionLabel: string }) => 
      fileService.restoreVersion(data.fileId, data.versionLabel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] })
      queryClient.invalidateQueries({ queryKey: ['fileVersions', showVersionHistory] })
      setShowVersionHistory(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (fileId: number) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] })
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileId?: number) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return
    
    if (fileId) {
      uploadVersionMutation.mutate({ file, fileId })
    } else {
      setUploading(true)
      uploadMutation.mutate({ file, projectId: parseInt(projectId) })
    }
  }

  if (!projectId) {
    return (
      <div className="text-center py-12 card">
        <p className="text-slate-400">Please select a project from the Projects page to view its files.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">File library</div>
          <div className="text-2xl font-semibold">Versioned assets</div>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload file'}
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>
      <div className="card overflow-hidden">
        {files && files.length > 0 ? (
          <div className="divide-y divide-white/5">
            {files.map((file: FileItem) => (
              <div key={file.id}>
                <div className="px-4 py-4 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                     onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{file.name}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {file.sizeInBytes ? `${(file.sizeInBytes / 1024).toFixed(1)} KB` : 'N/A'} • 
                      {file.uploadedBy ? ` ${file.uploadedBy.name}` : ' Unknown'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowVersionHistory(showVersionHistory === file.id ? null : file.id)
                      }}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="View versions"
                    >
                      <ClockIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    <label className="p-2 hover:bg-white/10 rounded transition-colors cursor-pointer"
                           title="Upload new version">
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400" />
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, file.id)}
                      />
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this file?')) {
                          deleteMutation.mutate(file.id)
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete file"
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                    <ChevronDownIcon 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedFileId === file.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded File Details */}
                {expandedFileId === file.id && (
                  <div className="bg-white/5 px-4 py-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase">File Type</p>
                        <p className="text-sm font-medium">{file.contentType || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Size</p>
                        <p className="text-sm font-medium">{file.sizeInBytes ? `${(file.sizeInBytes / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Version History */}
                    {showVersionHistory === file.id && fileVersions && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Version History</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {(fileVersions as FileVersion[]).map((version) => (
                            <div key={version.id} className="bg-white/5 p-3 rounded flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{version.versionLabel}</p>
                                <p className="text-xs text-slate-400">
                                  {(version.sizeInBytes / 1024).toFixed(1)} KB • 
                                  {version.uploadedBy ? ` ${version.uploadedBy.name}` : ' Unknown'}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm(`Restore to ${version.versionLabel}?`)) {
                                    restoreMutation.mutate({ fileId: file.id, versionLabel: version.versionLabel })
                                  }
                                }}
                                className="px-3 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 transition-colors"
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No files uploaded yet. Upload your first file to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

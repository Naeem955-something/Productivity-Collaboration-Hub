import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PaintBrushIcon, TrashIcon, ArrowUturnLeftIcon, PencilIcon } from '@heroicons/react/24/outline'

interface DrawingPoint {
  x: number
  y: number
  type: 'line' | 'rect' | 'circle' | 'text'
}

export default function Whiteboard() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawTool, setDrawTool] = useState<'pen' | 'rect' | 'circle' | 'text'>('pen')
  const [strokeColor, setStrokeColor] = useState('#60a5fa')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [history, setHistory] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to window size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Fill with white background
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
    }
  }, [])

  const getCanvasContext = () => {
    const canvas = canvasRef.current
    return canvas?.getContext('2d')
  }

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = getCanvasContext()
    if (ctx) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Save current state for undo
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setHistory([...history, imageData])

      if (drawTool === 'pen') {
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }

    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = getCanvasContext()
    if (ctx && drawTool === 'pen') {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getCanvasContext()
    if (ctx && canvas) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setHistory([])
    }
  }

  const undo = () => {
    if (history.length === 0) return

    const canvas = canvasRef.current
    const ctx = getCanvasContext()
    if (ctx && canvas) {
      const newHistory = [...history]
      const previousState = newHistory.pop()
      if (previousState) {
        ctx.putImageData(previousState, 0, 0)
      }
      setHistory(newHistory)
    }
  }

  if (!projectId) {
    return (
      <div className="card p-8 text-center">
        <PaintBrushIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-400">Select a project to use the whiteboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
      <div>
        <div className="text-2xl font-semibold">Interactive Whiteboard</div>
        <div className="text-slate-400 text-sm mt-1">Real-time collaborative drawing</div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
          <button
            onClick={() => setDrawTool('pen')}
            className={`p-2 rounded ${drawTool === 'pen' ? 'bg-primary text-white' : 'bg-white/10'}`}
            title="Pen"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Color:</label>
          <input
            type="color"
            value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded"
          />
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
          <label className="text-sm text-slate-400">Width:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={e => setStrokeWidth(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-400 w-6">{strokeWidth}px</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-auto">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="btn-ghost text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={clearCanvas}
            className="btn-ghost text-sm flex items-center gap-1 text-red-400"
          >
            <TrashIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="card flex-1 p-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full bg-white cursor-crosshair border border-slate-700 rounded"
        />
      </div>

      {/* Info */}
      <div className="text-xs text-slate-500 text-center">
        💡 Tip: Draw freely on the canvas. Share your screen with team members for real-time collaboration.
      </div>
    </div>
  )
}

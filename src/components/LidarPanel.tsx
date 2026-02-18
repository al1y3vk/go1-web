import { useRef, useState, useEffect, useCallback } from 'react'
import { useScan } from '../hooks/useScan'

export function LidarPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(3)
  const [showPoints, setShowPoints] = useState(true)
  const [showFill, setShowFill] = useState(false)
  const { scanRef, hzRef } = useScan()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2
    const scale = Math.min(cx, cy) * 0.9 / zoom

    // Range rings
    ctx.strokeStyle = '#1a2a3a'
    ctx.lineWidth = 1
    ctx.fillStyle = '#334'
    ctx.font = `${11 * dpr}px sans-serif`
    for (let r = 1; r <= zoom; r++) {
      ctx.beginPath()
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillText(`${r}m`, cx + r * scale + 3, cy - 3)
    }

    // Axes
    ctx.strokeStyle = '#223'
    ctx.beginPath()
    ctx.moveTo(0, cy); ctx.lineTo(w, cy)
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h)
    ctx.stroke()

    const scan = scanRef.current
    if (!scan) {
      ctx.fillStyle = '#556'
      ctx.font = `${14 * dpr}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('No scan data', cx, cy + 30 * dpr)
      ctx.textAlign = 'start'
      return
    }

    const points: { x: number; y: number }[] = []
    for (let i = 0; i < scan.ranges.length; i++) {
      const r = scan.ranges[i]
      if (!isFinite(r) || r < scan.range_min || r > scan.range_max) continue
      const angle = scan.angle_min + i * scan.angle_increment
      points.push({
        x: cx + r * Math.sin(angle) * scale,
        y: cy - r * Math.cos(angle) * scale,
      })
    }

    if (showFill && points.length > 2) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.closePath()
      ctx.fillStyle = 'rgba(0, 200, 120, 0.08)'
      ctx.fill()
    }

    if (showPoints) {
      ctx.fillStyle = '#00e676'
      const ptSize = Math.max(1.5, 3 * dpr / 2)
      points.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, ptSize, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Robot center dot + forward arrow
    ctx.fillStyle = '#ff5252'
    ctx.beginPath()
    ctx.arc(cx, cy, 5 * dpr, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ff5252'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx, cy - 15 * dpr)
    ctx.stroke()
  }, [zoom, showPoints, showFill, scanRef])

  // Resize canvas on container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new ResizeObserver(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      draw()
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [draw])

  // Animation loop — redraws at display refresh rate
  useEffect(() => {
    let rafId: number
    function loop() { draw(); rafId = requestAnimationFrame(loop) }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [draw])

  return (
    <div className="panel">
      <div className="panel-header">Lidar Scan</div>
      <div className="controls">
        <label>Zoom:</label>
        <input type="range" min="0.5" max="10" step="0.5" value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))} />
        <span>{zoom.toFixed(1)} m</span>
        <label>Points:</label>
        <input type="checkbox" checked={showPoints}
          onChange={e => setShowPoints(e.target.checked)} />
        <label>Fill:</label>
        <input type="checkbox" checked={showFill}
          onChange={e => setShowFill(e.target.checked)} />
      </div>
      <div className="panel-body" ref={containerRef}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="stats">
        {scanRef.current ? `${scanRef.current.ranges.length} points` : '0 points'} | {hzRef.current.toFixed(1)} Hz
      </div>
    </div>
  )
}

"use client"
import { useEffect, useRef } from 'react'

interface VisualizerProps {
  analyser: AnalyserNode | null
  color?: string
}

export default function AudioVisualizer({ analyser, color = '#0FADA0' }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      // Translucent clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        grad.addColorStop(0, color)
        grad.addColorStop(1, 'rgba(15,173,160,0.5)')
        ctx.fillStyle = grad

        // Render bars symmetrically from center
        const centerY = canvas.height / 2
        ctx.fillRect(x, centerY - barHeight/2, barWidth, barHeight)

        x += barWidth + 1
        if (x > canvas.width) break
      }
    }

    draw()
  }, [analyser, color])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      style={{
        width: '100%', height: 80, display: 'block',
        pointerEvents: 'none', filter: 'blur(0.5px)',
      }}
    />
  )
}

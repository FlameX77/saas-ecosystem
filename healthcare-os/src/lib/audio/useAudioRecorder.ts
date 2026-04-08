"use client"
import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = mediaStream

      // Set up analyzer for visualizer
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContext.current = ctx
      const source = ctx.createMediaStreamSource(mediaStream)
      const analyzerNode = ctx.createAnalyser()
      analyzerNode.fftSize = 256
      source.connect(analyzerNode)
      setAnalyser(analyzerNode)

      const recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' })
      mediaRecorder.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAnalyser(null)
      }

      recorder.start(1000) // Record in 1s chunks
      setIsRecording(true)
      setDuration(0)
      timer.current = setInterval(() => setDuration(d => d + 1), 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      toast.error('Microphone access denied')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      stream.current?.getTracks().forEach(track => track.stop())
      if (timer.current) clearInterval(timer.current)
      setIsRecording(false)
    }
  }, [isRecording])

  const clearRecording = useCallback(() => {
    setAudioBlob(null)
    setDuration(0)
  }, [])

  return {
    isRecording,
    duration,
    audioBlob,
    analyser,
    startRecording,
    stopRecording,
    clearRecording
  }
}

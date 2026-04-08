"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'
import { Badge } from './Badge'

interface SoapCardProps {
  label: string
  name: string
  defaultValue: string
}

export default function InteractiveSoapCard({ label, name, defaultValue }: SoapCardProps) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      animate={{
        borderColor: focused ? 'rgba(15,173,160,0.3)' : 'rgba(255,255,255,0.06)',
        boxShadow: focused ? '0 0 0 3px rgba(15,173,160,0.1)' : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.2 }}
      style={{ borderRadius: 12, border: '1px solid transparent' }}
    >
      <GlassCard>
        <div style={{ padding: 16, borderLeft: '3px solid var(--teal)' }}>
          <Badge variant="success">{label} — {name}</Badge>
          <textarea
            defaultValue={defaultValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              background: 'transparent', border: 'none', color: '#d0d0d0',
              fontSize: 13, lineHeight: 1.7, resize: 'none', width: '100%', minHeight: 60,
              marginTop: 8, outline: 'none'
            }}
          />
        </div>
      </GlassCard>
    </motion.div>
  )
}

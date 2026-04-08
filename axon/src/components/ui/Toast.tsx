'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#162236',
          color: '#E8F0FE',
          border: '1px solid #1E2D45',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'DM Sans, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#00C853',
            secondary: '#162236',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF1744',
            secondary: '#162236',
          },
        },
      }}
    />
  )
}

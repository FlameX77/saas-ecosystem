interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | number
  strokeWidth?: number
}

const spinSizes = { sm: 16, md: 24, lg: 40 }

export default function LoadingSpinner({ size = 'md', strokeWidth = 2 }: LoadingSpinnerProps) {
  const px = typeof size === 'number' ? size : spinSizes[size]
  return (
    <div style={{
      width: px, height: px, border: `${strokeWidth}px solid rgba(15,173,160,0.1)`,
      borderTopColor: '#0FADA0', borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

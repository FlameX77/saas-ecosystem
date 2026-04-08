interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const spinSizes = { sm: 16, md: 24, lg: 40 }

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const px = spinSizes[size]
  return (
    <div style={{
      width: px, height: px, border: '2px solid var(--border)',
      borderTopColor: 'var(--teal)', borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

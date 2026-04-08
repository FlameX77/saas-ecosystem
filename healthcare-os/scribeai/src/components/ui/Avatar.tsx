interface AvatarProps {
  src?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 28, md: 36, lg: 44 }

function hashColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash) % 360}, 45%, 35%)`
}

export default function Avatar({ src, fallback, size = 'md', className = '' }: AvatarProps) {
  const initials = fallback.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const px = sizes[size]
  
  return (
    <div 
      className={className}
      style={{
        width: px, height: px, borderRadius: '50%',
        background: src ? 'transparent' : hashColor(fallback),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: px * 0.38, fontWeight: 600, color: '#fff',
        flexShrink: 0,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {src ? (
        <img src={src} alt={fallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  )
}

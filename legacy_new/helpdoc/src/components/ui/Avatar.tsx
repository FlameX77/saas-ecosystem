interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 28, md: 36, lg: 44 }

function hashColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 45%, 35%)`
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const px = sizes[size]
  return (
    <div style={{
      width: px, height: px, borderRadius: '50%',
      background: hashColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: px * 0.38, fontWeight: 600, color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

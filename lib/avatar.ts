export const AVATAR_COLORS = [
  'bg-avatar-blue',
  'bg-avatar-pink',
  'bg-avatar-sky',
  'bg-avatar-lime',
  'bg-avatar-amber',
  'bg-avatar-purple',
]

export function initialsOf(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function avatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

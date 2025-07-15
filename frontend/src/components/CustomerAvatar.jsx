// CustomerAvatar.jsx
export default function CustomerAvatar({ name, size = 48 }) {
  const initials = name
    ? name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CU'
  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-600 text-white font-bold"
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      {initials}
    </div>
  )
}

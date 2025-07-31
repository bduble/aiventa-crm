export default function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .join('')
    .toUpperCase();
  return (
    <span className="bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
      {initials}
    </span>
  );
}

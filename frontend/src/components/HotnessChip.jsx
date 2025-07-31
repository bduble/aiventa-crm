export default function HotnessChip({ score }) {
  let color = 'bg-gray-400';
  let text = 'Neutral';
  if (score >= 8) { color = 'bg-green-600'; text = 'Hot'; }
  else if (score >= 5) { color = 'bg-yellow-400'; text = 'Warm'; }
  else if (score > 0) { color = 'bg-red-500'; text = 'Cold'; }
  return (
    <span className={`px-2 py-1 rounded-full text-xs text-white font-bold ${color}`}>
      {text}
    </span>
  );
}

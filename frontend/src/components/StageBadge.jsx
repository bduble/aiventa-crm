export default function StageBadge({ stage }) {
  const colorMap = {
    'New': 'bg-blue-500',
    'Active': 'bg-green-600',
    'Sold': 'bg-gray-700',
    'Service': 'bg-orange-500',
    'Lost': 'bg-red-500',
    // Add more as needed
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs text-white font-semibold ${colorMap[stage] || 'bg-slate-400'}`}>
      {stage}
    </span>
  );
}

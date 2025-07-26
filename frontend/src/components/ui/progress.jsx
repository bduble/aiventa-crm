export function Progress({ value = 0, className = '', ...props }) {
  // Clamp between 0 and 100
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`relative w-full bg-gray-200 rounded-full overflow-hidden ${className}`} style={{ height: '8px' }} {...props}>
      <div
        className="bg-blue-600 h-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      ></div>
    </div>
  );
}

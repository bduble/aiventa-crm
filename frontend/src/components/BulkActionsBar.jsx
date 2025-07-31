export default function BulkActionsBar({
  count,
  onClear,
  onMassText,
  onMassEmail,
  onTag,
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-900 text-white flex items-center justify-between px-8 py-3 z-40 shadow-xl">
      <div>
        <b>{count}</b> selected
      </div>
      <div className="flex gap-2">
        <button onClick={onMassText} className="bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-600 font-bold">Mass Text</button>
        <button onClick={onMassEmail} className="bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-600 font-bold">Mass Email</button>
        <button onClick={onTag} className="bg-green-500 px-4 py-2 rounded-xl hover:bg-green-600 font-bold">Tag</button>
        <button onClick={onClear} className="bg-gray-300 text-blue-900 px-4 py-2 rounded-xl font-bold">Clear</button>
      </div>
    </div>
  );
}

import { useRef } from 'react';

export default function ImportCSVModal({ open, onClose, onImport }) {
  const fileInput = useRef();
  if (!open) return null;

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      // Basic CSV parsing (swap for better parser if needed)
      const rows = event.target.result.split('\n').map(line => line.split(','));
      const headers = rows[0];
      const customers = rows.slice(1).filter(r => r.length === headers.length).map(r =>
        Object.fromEntries(r.map((v, i) => [headers[i], v]))
      );
      onImport(customers);
      onClose();
    };
    reader.readAsText(file);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[340px] flex flex-col gap-4">
        <div className="text-xl font-bold mb-2">Import Customers (CSV)</div>
        <input type="file" accept=".csv" ref={fileInput} onChange={handleFile} className="border p-2" />
        <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
      </div>
    </div>
  );
}

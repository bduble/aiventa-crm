import { useState } from 'react';

export default function MassTextModal({ open, onClose, onSend, count }) {
  const [message, setMessage] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[340px] flex flex-col gap-4">
        <div className="text-xl font-bold mb-2">Send Text to {count} Customers</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="border rounded p-2 min-h-[80px]"
          placeholder="Type your message here…"
        />
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onSend(message); setMessage(''); }} className="bg-blue-700 text-white px-4 py-2 rounded-xl font-bold">Send</button>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
        </div>
      </div>
    </div>
  );
}

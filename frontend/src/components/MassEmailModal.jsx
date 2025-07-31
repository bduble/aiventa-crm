import { useState } from 'react';

export default function MassEmailModal({ open, onClose, onSend, count }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[340px] flex flex-col gap-4">
        <div className="text-xl font-bold mb-2">Send Email to {count} Customers</div>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="border rounded p-2"
          placeholder="Email Subject"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="border rounded p-2 min-h-[80px]"
          placeholder="Email Body…"
        />
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onSend({ subject, body }); setSubject(''); setBody(''); }} className="bg-blue-700 text-white px-4 py-2 rounded-xl font-bold">Send</button>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useState } from 'react';
export default function EmailModal({ isOpen, onClose, customer }) {
  const [toEmail, setToEmail] = useState(customer?.email || '');
  const [subject, setSubject] = useState('');

  const [bodyHtml, setBodyHtml] = useState('');
  const [status, setStatus] = useState('');
  const editorRef = useRef(null);

  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');


  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const sendEmail = async () => {
    try {
      const res = await fetch(`${API_BASE}/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: toEmail,
          subject,

          body: bodyHtml,

          body,

          customer_id: customer?.id,
        }),
      });
      if (res.ok) setStatus('Sent!');
      else setStatus('Error sending email.');
    } catch {
      setStatus('Error sending email.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-xl space-y-4">
        <h3 className="text-lg font-semibold">Compose Email</h3>
        <input
          value={toEmail}
          onChange={e => setToEmail(e.target.value)}
          placeholder="To"
          className="w-full border rounded px-3 py-2"
        />
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex gap-2 text-sm">
          <button type="button" onClick={() => document.execCommand('bold')} className="px-2 py-1 border rounded">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => document.execCommand('italic')} className="px-2 py-1 border rounded italic">
            I
          </button>
          <button type="button" onClick={() => document.execCommand('underline')} className="px-2 py-1 border rounded underline">
            U
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={e => setBodyHtml(e.currentTarget.innerHTML)}
          className="border rounded px-3 py-2 min-h-[150px] bg-white text-black dark:bg-gray-700 dark:text-white"
        />

        <ReactQuill theme="snow" value={body} onChange={setBody} className="bg-white" />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={6}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">
            Cancel
          </button>
          <button type="button" onClick={sendEmail} className="px-3 py-2 bg-electricblue text-white rounded">
            Send Email
          </button>
        </div>
        {status && <div className="text-sm">{status}</div>}
      </div>
    </div>
  );
}

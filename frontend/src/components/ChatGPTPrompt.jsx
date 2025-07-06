import { useState } from 'react';

export default function ChatGPTPrompt() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [open, setOpen] = useState(false);

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/leads`;

  const askQuestion = async () => {
    if (!question.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setAnswer(data.answer || 'No response');
    } catch (err) {
      console.error(err);
      setAnswer('Failed to get response');
    }
    setOpen(true);
  };

  return (
    <>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Ask ChatGPT"
          aria-label="Ask a question to ChatGPT"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={askQuestion} className="bg-electricblue text-white px-2 py-1 rounded">
          Ask
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-lg w-full" id="modal-title">
            <pre className="whitespace-pre-wrap">{answer}</pre>
            <div className="text-right mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-2 bg-electricblue text-white rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

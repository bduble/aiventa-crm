import { useState, useRef, useEffect } from 'react';

export default function ChatGPTPrompt() {
  const [question, setQuestion]   = useState('');
  const [answer, setAnswer]       = useState('');
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const sourceRef = useRef(null);               // keep EventSource between renders

  // Adjust the base URL + route to match your new FastAPI handler
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const STREAM_ENDPOINT = `${API_BASE}/ai/ask-stream`; // GET /ai/ask-stream?q=

  /** Open modal + fire SSE request */
  const askQuestion = () => {
    if (!question.trim()) return;

    // reset UI
    setAnswer('');
    setOpen(true);
    setLoading(true);

    // encode the question as query‑string since EventSource is GET‑only
    const qs = new URLSearchParams({ q: question.trim() });
    const es  = new EventSource(`${STREAM_ENDPOINT}?${qs.toString()}`, {
      withCredentials: true,
    });
    sourceRef.current = es;

    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        es.close();
        setLoading(false);
      } else {
        // append new tokens as they arrive
        setAnswer((prev) => prev + e.data);
      }
    };

    es.onerror = (err) => {
      console.error('SSE error:', err);
      setAnswer('⚠️ Failed to get response');
      es.close();
      setLoading(false);
    };
  };

  /** Clean up EventSource when modal closes or component unmounts */
  useEffect(() => {
    return () => sourceRef.current?.close();
  }, []);

  return (
    <>
      {/* ── Prompt bar ───────────────────────────────────────────── */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Ask aiVenta"
          aria-label="Ask a question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          style={{
            padding: '0.25rem 0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            color: '#000000',
          }}
        />
        <button
          onClick={askQuestion}
          className="bg-electricblue text-white px-2 py-1 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>

      {/* ── Modal ────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-lg w-full"
            id="modal-title"
          >
            <pre className="whitespace-pre-wrap min-h-[6rem]">{answer || (loading && 'Thinking…')}</pre>

            <div className="text-right mt-4 flex justify-end gap-2">
              {loading && (
                <button
                  onClick={() => {
                    sourceRef.current?.close();
                    setLoading(false);
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Stop
                </button>
              )}
              <button
                onClick={() => {
                  sourceRef.current?.close();
                  setOpen(false);
                  setLoading(false);
                }}
                className="px-3 py-2 bg-electricblue text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

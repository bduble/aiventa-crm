import { useState } from 'react';

export default function ChatPage() {
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/chat`;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (data.answer) {
        setMessages(m => [...m, { role: 'assistant', content: data.answer }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(m => [...m, { role: 'assistant', content: 'Failed to get response' }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Chat</h1>
      <div className="border rounded p-3 space-y-2 bg-white dark:bg-gray-900">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded dark:bg-gray-900 dark:border-gray-600"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask something..."
        />
        <button onClick={sendMessage} className="bg-electricblue text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

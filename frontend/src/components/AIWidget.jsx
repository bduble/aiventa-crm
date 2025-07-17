import { useState } from 'react';
import { Bot, X } from "lucide-react";
import ChatGPTPrompt from "./ChatGPTPrompt";

export default function AIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl w-80">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              AI Assistant
            </h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ChatGPTPrompt />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="bg-electricblue text-white p-3 rounded-full shadow-lg"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

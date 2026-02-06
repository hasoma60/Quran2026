import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askQuranAI } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SparkleIcon, ArrowIcon } from './Icons';
import { AI_CONTEXT_HISTORY_LIMIT } from '../utils/constants';

interface AIChatProps {
  initialContext?: string;
  chatMessages: ChatMessage[];
  setChatMessages: (msgs: ChatMessage[]) => void;
}

export default function AIChat({ initialContext, chatMessages, setChatMessages }: AIChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const context = updatedMessages.slice(-AI_CONTEXT_HISTORY_LIMIT).map(m => `${m.role}: ${m.text}`).join('\n');
    const responseText = await askQuranAI(text, context);

    setChatMessages([...updatedMessages, { role: 'model', text: responseText }]);
    setLoading(false);
  }, [chatMessages, loading, setChatMessages]);

  // Handle auto-sending context
  useEffect(() => {
    if (initialContext && !initialSent.current && chatMessages.length <= 1) {
      initialSent.current = true;
      sendMessage(initialContext);
    }
  }, [initialContext, sendMessage, chatMessages.length]);

  const handleSend = () => sendMessage(input);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4" role="log" aria-label="محادثة مع نور">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed text-right ${
                msg.role === 'user'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800/50'
                  : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <SparkleIcon size={10} className="text-amber-600 dark:text-amber-500" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-sans">نور الذكي</span>
                </div>
              )}
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 flex gap-2" aria-label="جاري الكتابة">
              <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن القرآن..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pr-5 pl-12 py-3.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            aria-label="اكتب سؤالك"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute left-2 top-2 p-1.5 bg-amber-600 text-white rounded-full disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 transition-colors"
            aria-label="إرسال"
          >
            <ArrowIcon size={20} className="transform rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

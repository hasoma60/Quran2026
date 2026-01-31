import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askQuranAI } from '../services/geminiService';
import { ChatMessage } from '../types';
import { STORAGE_KEYS, AI_CONTEXT_MESSAGES } from '../constants';

interface AIChatProps {
  initialContext?: string;
}

export default function AIChat({ initialContext }: AIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* ignore */ }
    }
    return [{ role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا "نور"، مساعدك القرآني. كيف يمكنني مساعدتك في رحلتك مع القرآن اليوم؟' }];
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialContextSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const context = messages.slice(-AI_CONTEXT_MESSAGES).map(m => `${m.role}: ${m.text}`).join('\n');
    const responseText = await askQuranAI(text, context);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  }, [input, loading, messages]);

  // Handle auto-sending context
  useEffect(() => {
    if (initialContext && !initialContextSent.current) {
      initialContextSent.current = true;
      setInput('');
      handleSend(initialContext);
    }
  }, [initialContext, handleSend]);

  const clearHistory = () => {
    const welcomeMsg: ChatMessage = { role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا "نور"، مساعدك القرآني. كيف يمكنني مساعدتك في رحلتك مع القرآن اليوم؟' };
    setMessages([welcomeMsg]);
  };

  // Simple markdown-like rendering
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Headers
      if (line.startsWith('### ')) rendered = `<h4 class="font-bold text-base mt-3 mb-1">${line.slice(4)}</h4>`;
      else if (line.startsWith('## ')) rendered = `<h3 class="font-bold text-lg mt-3 mb-1">${line.slice(3)}</h3>`;
      else if (line.startsWith('# ')) rendered = `<h2 class="font-bold text-xl mt-3 mb-1">${line.slice(2)}</h2>`;
      // Bullet points
      else if (line.startsWith('- ') || line.startsWith('* ')) rendered = `<div class="flex gap-2 items-start"><span class="text-amber-500 mt-0.5">•</span><span>${rendered.slice(2)}</span></div>`;
      return <div key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header with clear button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">محادثة مع نور</h2>
        {messages.length > 1 && (
          <button
            onClick={clearHistory}
            className="text-zinc-400 hover:text-red-500 text-xs font-sans transition-colors"
            aria-label="مسح المحادثة"
          >
            مسح المحادثة
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
        {messages.map((msg, idx) => (
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
                    <svg className="text-amber-600 dark:text-amber-500 w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-sans">نور الذكي</span>
                </div>
              )}
              <div className="whitespace-pre-wrap font-sans">
                {msg.role === 'model' ? renderText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 flex gap-2">
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
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن القرآن..."
            aria-label="اكتب سؤالك"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pr-5 pl-12 py-3.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="إرسال"
            className="absolute left-2 top-2 p-1.5 bg-amber-600 text-white rounded-full disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

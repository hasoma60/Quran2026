import React, { useState, useRef, useEffect } from 'react';
import { askQuranAI } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIChatProps {
  initialContext?: string;
}

export default function AIChat({ initialContext }: AIChatProps) {
  const [input, setInput] = useState(initialContext || '');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا "نور"، مساعدك القرآني. كيف يمكنني مساعدتك في رحلتك مع القرآن اليوم؟' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle auto-sending context if it's a verse explanation request
  useEffect(() => {
    if (initialContext && messages.length === 1) {
      handleSend();
    }
  }, [initialContext]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Context from previous messages (simplified history)
    const context = messages.slice(-3).map(m => `${m.role}: ${m.text}`).join('\n');
    
    const responseText = await askQuranAI(userMessage.text, context);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
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
              {/* Basic Markdown rendering replacement for simple formatting */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 flex gap-2">
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pr-5 pl-12 py-3.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute left-2 top-2 p-1.5 bg-amber-600 text-white rounded-full disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 transition-colors"
          >
            {/* Mirrored icon for RTL send */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
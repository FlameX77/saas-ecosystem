'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVibeStore } from '@/lib/store';
import axios from 'axios';
import { Send, Bot, User, Sparkles, Terminal as TerminalIcon, FileCode, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const { messages, addMessage, setIsThinking, isThinking, activeFile } = useVibeStore();
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMessage = { role: 'user' as const, content: input };
    addMessage(userMessage);
    setInput('');
    setIsThinking(true);

    try {
      const response = await axios.post('/api/chat', { 
        messages: [...messages, userMessage],
        apiKey 
      });
      
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: response.data.content[0].text 
      };
      addMessage(assistantMessage);
      
      // AI parsing for tool use would go here
    } catch (err: any) {
      addMessage({ 
        role: 'system', 
        content: `Error: ${err.response?.data?.error?.message || err.message}` 
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl border-l border-zinc-800 shadow-2xl">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
           <Bot className="w-4 h-4 text-blue-500" /> VIBE ASSISTANT
        </h3>
        <button 
           onClick={() => setShowApiKey(!showApiKey)}
           className="text-[10px] text-zinc-600 hover:text-blue-500 transition-colors uppercase font-mono tracking-tighter"
        >
           {showApiKey ? 'Hide Key' : 'API KEY'}
        </button>
      </div>

      {showApiKey && (
        <div className="p-3 border-b border-zinc-800 animate-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder="Paste Anthropic API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700"
            />
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <p className="text-sm font-medium text-zinc-300">Talk to VibeCoder</p>
             <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
                "Make this UI glassmorphic."<br />
                "Refactor the file tree logic."<br />
                "Setup an API proxy."
             </p>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div key={idx} className={cn(
             "group flex flex-col gap-2 transition-all duration-300 transform",
             m.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className={cn(
               "max-w-[90%] flex items-start gap-3",
               m.role === 'user' && "flex-row-reverse"
            )}>
               <div className={cn(
                  "p-1.5 rounded-lg flex-shrink-0 animate-in zoom-in-50",
                  m.role === 'user' ? "bg-zinc-800 text-zinc-300 shadow-xl shadow-black/20" : "bg-blue-600/10 text-blue-400 border border-blue-500/20"
               )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
               </div>
               <div className={cn(
                  "p-3 rounded-2xl text-xs leading-relaxed transition-all",
                  m.role === 'user' ? "bg-zinc-900 border border-zinc-800" : "bg-zinc-950 border border-zinc-800/50"
               )}>
                  <pre className="whitespace-pre-wrap font-sans text-zinc-300/90">{m.content}</pre>
               </div>
            </div>
          </div>
        ))}
        {isThinking && (
           <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-tighter opacity-80 pl-2">
              <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-0" />
                 <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150" />
                 <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-300" />
              </div>
              <span>VIBECODER IS THINKING...</span>
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/80">
        <div className="relative group">
           <textarea 
             rows={3}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
               }
             }}
             placeholder={apiKey ? "Describe what to build..." : "Set API Key above to start..."}
             className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none placeholder:text-zinc-700 shadow-inner"
           />
           <button 
             onClick={handleSend}
             disabled={!input.trim() || !apiKey || isThinking}
             className="absolute bottom-3 right-3 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
           >
              <Send className="w-3.5 h-3.5" />
           </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-700 tracking-tighter uppercase px-1">
           <div className="flex items-center gap-1.5 group cursor-help transition-all hover:text-zinc-500">
              <FileCode className={cn("w-3 h-3", activeFile ? "text-blue-500/50" : "text-zinc-800")} />
              {activeFile ? activeFile.split('/').pop() : 'NO FILE SELECTED'}
           </div>
           <div className="flex items-center gap-1.5 hover:text-zinc-500 transition-all cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              SYST: GPT-4 READY
           </div>
        </div>
      </div>
    </div>
  );
}

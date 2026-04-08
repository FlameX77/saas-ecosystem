'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Terminal, 
  Activity,
  History,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Novu Intelligence active. Identified 3 high-value denials (AED 37.4k) from Daman. Fix code 99213?" }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'ai', 
        content: `Analyzing UAE insurer rules for '${input}'. Daman requires modifier '25' for this claim. Batch resubmission staged.`
      }]);
    }, 1200);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <aside className="hidden xl:flex flex-col w-[340px] h-screen bg-background border-l border-border z-50 overflow-hidden">
      
      {/* 🔮 HEADER */}
      <div className="p-6 border-b border-border bg-card/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group transition-all">
            <Sparkles className="h-5 w-5 group-hover:scale-110" />
          </div>
          <div>
            <h4 className="text-sm font-display font-medium text-white italic leading-none">NOVU AI</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest opacity-60">Intelligence Live</span>
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-white">
          <HistoryIcon className="h-4 w-4" />
        </button>
      </div>

      {/* 🌊 MESSAGE AREA */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
            <span className="text-[9px] font-mono uppercase tracking-widest opacity-30 mb-2">{msg.role === 'ai' ? 'Novu Engine' : 'CFO Operator'}</span>
            <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-body ${msg.role === 'ai' ? 'bg-card/50 text-slate-300 border border-border/50' : 'bg-primary text-background font-bold'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* ⌨️ INPUT AREA */}
      <div className="p-6 border-t border-border bg-card/5 space-y-4">
        <div className="relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Search UAE insurance policies..."
            className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-body pr-12 min-h-[100px] resize-none"
          />
          <button 
            onClick={handleSendMessage}
            className="absolute right-3 bottom-3 h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-background hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_-5px_rgba(0,212,170,0.4)]"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        
        <div className="flex gap-2 justify-center flex-wrap">
          {[ 'Daman Rules', 'ADNIC Audit', 'Resubmit All' ].map(chip => (
            <button key={chip} className="text-[10px] font-mono uppercase bg-white/5 border border-white/5 px-3 py-1 rounded-full text-muted-foreground hover:text-primary hover:border-primary/20 transition-all">
              {chip}
            </button>
          ))}
        </div>

        <div className="pt-4 flex items-center justify-between text-[10px] font-mono text-muted-foreground/40 italic">
          <div className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> RAG Precision: 0.94</div>
          <div>Llama 3 @ 12.4ms</div>
        </div>
      </div>
    </aside>
  );
}

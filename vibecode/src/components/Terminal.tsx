'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVibeStore } from '@/lib/store';
import axios from 'axios';
import { ChevronRight, Terminal as TerminalIcon } from 'lucide-react';

export default function Terminal() {
  const { terminalOutput, addTerminalOutput, clearTerminal, projectRoot } = useVibeStore();
  const [cmd, setCmd] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [terminalOutput]);

  const runCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;

    addTerminalOutput(`$ ${cmd}`);
    setCmd('');

    try {
      const response = await axios.post('/api/terminal', {
        command: cmd,
        cwd: projectRoot
      });
      if (response.data.stdout) addTerminalOutput(response.data.stdout);
      if (response.data.stderr) addTerminalOutput(`Error: ${response.data.stderr}`);
    } catch (err: any) {
      addTerminalOutput(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between px-4 h-9 border-b border-zinc-800 bg-zinc-900/30">
         <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            <TerminalIcon className="w-3 h-3 text-blue-500/50" /> TERMINAL
         </div>
         <button 
           onClick={clearTerminal}
           className="text-zinc-700 hover:text-zinc-500 transition-colors text-[10px] uppercase font-mono tracking-tighter"
         >
           Clear
         </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {terminalOutput.map((line, idx) => (
          <pre key={idx} className="whitespace-pre-wrap leading-relaxed opacity-90">{line}</pre>
        ))}
        {terminalOutput.length === 0 && (
           <div className="text-zinc-700 italic opacity-50 select-none">No output yet. System ready for commands.</div>
        )}
      </div>

      <form onSubmit={runCommand} className="flex px-4 py-2 border-t border-zinc-800/50 bg-zinc-900/20 group">
         <span className="mr-2 text-blue-500/80">$</span>
         <input 
           type="text"
           value={cmd}
           onChange={(e) => setCmd(e.target.value)}
           placeholder="Enter command..."
           className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder:text-zinc-800 w-full"
         />
      </form>
    </div>
  );
}

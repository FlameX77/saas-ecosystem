'use client';

import React from 'react';
import { useVibeStore } from '@/lib/store';
import FileTree from './FileTree';
import Editor from './Editor';
import Chat from './Chat';
import Terminal from './Terminal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { projectRoot } = useVibeStore();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      {/* Left Sidebar: File Tree */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tighter text-zinc-100 italic font-mono">VIBECODE</h2>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500/50" />
             <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
             <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
           <FileTree path={projectRoot} />
        </div>
      </aside>

      {/* Center: Editor & Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative">
           <Editor />
        </div>
        <div className="h-48 border-t border-zinc-800">
           <Terminal />
        </div>
      </main>

      {/* Right: AI Chat */}
      <aside className="w-96 border-l border-zinc-800 flex flex-col flex-shrink-0">
         <Chat />
      </aside>
    </div>
  );
}

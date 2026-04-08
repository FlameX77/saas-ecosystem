'use client';

import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useVibeStore } from '@/lib/store';
import axios from 'axios';
import { FileCode, Loader2, X } from 'lucide-react';

export default function Editor() {
  const { activeFile, openFiles, removeOpenFile, setActiveFile } = useVibeStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      if (!activeFile) {
        setContent('');
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`/api/files?action=read&path=${encodeURIComponent(activeFile)}`);
        setContent(response.data.content);
      } catch (err) {
        console.error('Failed to read file', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [activeFile]);

  const handleEditorChange = async (value: string | undefined) => {
    if (!activeFile || value === undefined) return;
    setContent(value);
    try {
      await axios.post('/api/files', { action: 'write', path: activeFile, content: value });
    } catch (err) {
      console.error('Failed to save file', err);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 bg-zinc-950 font-mono text-sm tracking-widest opacity-50 select-none">
        SELECT A FILE TO START VIBING
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-zinc-800">
      <div className="flex border-b border-zinc-800 h-10 overflow-x-auto scrollbar-none bg-zinc-950/50">
        {openFiles.map((file) => (
          <div
            key={file}
            onClick={() => setActiveFile(file)}
            className={`
              group flex items-center gap-2 px-3 h-full border-r border-zinc-800 cursor-pointer text-xs transition-colors whitespace-nowrap
              ${activeFile === file ? 'bg-zinc-900 text-zinc-100 border-t border-t-blue-500' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}
            `}
          >
            <FileCode className="w-3 h-3 text-blue-400/70" />
            <span>{file.split('/').pop()}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeOpenFile(file);
              }}
              className="p-1 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-zinc-950/50 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
          </div>
        )}
        <MonacoEditor
          height="100%"
          language={getLanguage(activeFile)}
          theme="vs-dark"
          value={content}
          onChange={handleEditorChange}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
            cursorStyle: 'line',
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden'
            },
            automaticLayout: true,
          }}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('rosepine', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '55617d', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'eb6f92' },
                { token: 'string', foreground: 'f6c177' },
                { token: 'number', foreground: 'c4a7e7' },
                { token: 'type', foreground: '9ccfd8' },
                { token: 'class', foreground: '9ccfd8' },
                { token: 'function', foreground: 'ebbcba' },
              ],
              colors: {
                'editor.background': '#09090b',
                'editor.foreground': '#e0def4',
                'editorLineNumber.foreground': '#6e6a86',
                'editorLineNumber.activeForeground': '#e0def4',
                'editorIndentGuide.background': '#1f1d2e',
                'editorIndentGuide.activeBackground': '#26233a',
              },
            });
          }}
        />
      </div>
    </div>
  );
}

function getLanguage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

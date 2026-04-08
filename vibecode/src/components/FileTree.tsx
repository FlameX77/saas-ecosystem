'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useVibeStore } from '@/lib/store';
import { ChevronRight, ChevronDown, Folder, File, FolderOpen, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
}

export default function FileTree({ path }: { path: string }) {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { setActiveFile, activeFile } = useVibeStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchNodes = async (dirPath: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/files?action=list&path=${encodeURIComponent(dirPath)}`);
      setNodes(response.data);
    } catch (err) {
      console.error('Failed to list files', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes(path);
  }, [path]);

  const toggleFolder = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="space-y-1 font-mono text-xs select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Files</span>
        <button onClick={() => fetchNodes(path)} className="text-zinc-600 hover:text-white transition-colors">
            <RefreshCcw className="w-3 h-3" />
        </button>
      </div>
      {nodes.map((node) => (
        <FileItem
          key={node.path}
          node={node}
          expanded={expanded[node.path]}
          toggleExpanded={() => toggleFolder(node.path)}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
      ))}
      {nodes.length === 0 && !loading && (
        <div className="text-[10px] text-zinc-700 italic px-2">Empty directory or scanning...</div>
      )}
    </div>
  );
}

function FileItem({ node, expanded, toggleExpanded, activeFile, setActiveFile }: {
  node: FileNode;
  expanded: boolean;
  toggleExpanded: () => void;
  activeFile: string | null;
  setActiveFile: (path: string) => void;
}) {
  const [children, setChildren] = useState<FileNode[]>([]);
  const isActive = activeFile === node.path;

  useEffect(() => {
    if (node.isDir && expanded) {
      axios.get(`/api/files?action=list&path=${encodeURIComponent(node.path)}`)
        .then(res => setChildren(res.data))
        .catch(err => console.error(err));
    }
  }, [expanded, node.isDir, node.path]);

  return (
    <div className="select-none">
      <div
        onClick={() => node.isDir ? toggleExpanded() : setActiveFile(node.path)}
        className={cn(
          "group flex items-center gap-1.5 px-2 py-1 rounded-sm cursor-pointer transition-all border border-transparent",
          isActive ? "bg-zinc-800/80 text-blue-400 border-zinc-700/50" : "hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
        )}
      >
        <span className="w-3 h-3 flex items-center justify-center">
            {node.isDir && (expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
        </span>
        {node.isDir ? (
           expanded ? <FolderOpen className="w-3.5 h-3.5 text-blue-500/80" /> : <Folder className="w-3.5 h-3.5 text-blue-500/80" />
        ) : (
          <File className="w-3.5 h-3.5 text-zinc-600/80" />
        )}
        <span className="truncate flex-1 py-0.5">{node.name}</span>
      </div>
      {node.isDir && expanded && (
        <div className="ml-3 border-l border-zinc-800 pl-1 mt-0.5 space-y-0.5">
          {children.map(child => (
            <FileItem
              key={child.path}
              node={child}
              expanded={false}
              toggleExpanded={() => {}}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

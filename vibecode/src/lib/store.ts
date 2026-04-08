import { create } from 'zustand';

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface VibeStore {
  projectRoot: string;
  activeFile: string | null;
  openFiles: string[];
  fileTree: FileNode[];
  messages: Message[];
  terminalOutput: string[];
  isThinking: boolean;
  
  setProjectRoot: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  addOpenFile: (path: string) => void;
  removeOpenFile: (path: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  addTerminalOutput: (output: string) => void;
  clearTerminal: () => void;
  setIsThinking: (thinking: boolean) => void;
}

export const useVibeStore = create<VibeStore>((set) => ({
  projectRoot: '/Users/ibrahimtariq/vibecode', // Default to current project for now
  activeFile: null,
  openFiles: [],
  fileTree: [],
  messages: [],
  terminalOutput: [],
  isThinking: false,

  setProjectRoot: (path) => set({ projectRoot: path }),
  setActiveFile: (path) => {
    set((state) => {
      if (path && !state.openFiles.includes(path)) {
        return { activeFile: path, openFiles: [...state.openFiles, path] };
      }
      return { activeFile: path };
    });
  },
  setFileTree: (tree) => set({ fileTree: tree }),
  addOpenFile: (path) => set((state) => ({ 
    openFiles: state.openFiles.includes(path) ? state.openFiles : [...state.openFiles, path] 
  })),
  removeOpenFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f !== path);
    return {
      openFiles: newOpenFiles,
      activeFile: state.activeFile === path ? (newOpenFiles[0] || null) : state.activeFile
    };
  }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  addTerminalOutput: (output) => set((state) => ({ 
    terminalOutput: [...state.terminalOutput, output].slice(-100) // Keep last 100 lines
  })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setIsThinking: (thinking) => set({ isThinking: thinking }),
}));

'use client';

import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useVibeStore } from '@/lib/store';

export default function Home() {
  const { setProjectRoot } = useVibeStore();

  useEffect(() => {
    // In a real app, this might come from a config or user input
    // For Ibrahim, we default it to the vibecode project itself or a known workspace
    setProjectRoot('/Users/ibrahimtariq/vibecode');
  }, [setProjectRoot]);

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
         {/* The center content is handled by Editor and Terminal within Layout */}
      </div>
    </Layout>
  );
}

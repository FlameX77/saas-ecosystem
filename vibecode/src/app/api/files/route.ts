import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const filePath = searchParams.get('path');

  if (!filePath) return NextResponse.json({ error: 'Path required' }, { status: 400 });

  try {
    if (action === 'list') {
      const stats = await fs.stat(filePath);
      if (!stats.isDirectory()) return NextResponse.json({ error: 'Not a directory' }, { status: 400 });
      
      const files = await fs.readdir(filePath, { withFileTypes: true });
      const nodes = files.map(f => ({
        name: f.name,
        path: path.join(filePath, f.name),
        isDir: f.isDirectory()
      }));
      return NextResponse.json(nodes);
    }

    if (action === 'read') {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json({ content });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { path: filePath, content, action } = body;

  if (!filePath) return NextResponse.json({ error: 'Path required' }, { status: 400 });

  try {
    if (action === 'write') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
       await fs.rm(filePath, { recursive: true, force: true });
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

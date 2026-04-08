import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const { command, cwd } = await req.json();

  if (!command) return NextResponse.json({ error: 'Command required' }, { status: 400 });

  try {
    const { stdout, stderr } = await execAsync(command, { cwd: cwd || process.cwd() });
    return NextResponse.json({ stdout, stderr });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr 
    }, { status: 500 });
  }
}

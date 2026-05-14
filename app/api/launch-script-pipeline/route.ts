import { exec } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execAsync = promisify(exec);

const INITIAL_PROMPT = "スライド原稿作成開始";

export async function POST() {
  const cwd = process.cwd();

  const shellCmd = `cd ${JSON.stringify(cwd)} && claude ${JSON.stringify(INITIAL_PROMPT)}`;
  const appleScript = `tell application "Terminal"
    activate
    do script ${JSON.stringify(shellCmd)}
end tell`;

  const tmpFile = path.join(os.tmpdir(), `launch-pipeline-${Date.now()}.applescript`);

  try {
    await writeFile(tmpFile, appleScript, "utf-8");
    await execAsync(`osascript ${JSON.stringify(tmpFile)}`);
    await unlink(tmpFile).catch(() => {});
    return NextResponse.json({ ok: true, cwd });
  } catch (error) {
    await unlink(tmpFile).catch(() => {});
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

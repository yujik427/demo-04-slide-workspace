import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

type WorkspaceStateV2Payload = {
  state?: unknown;
};

const statePath = path.join(process.cwd(), "data", "workspace-state-v2.json");
const backupPath = path.join(process.cwd(), "data", "workspace-state-v2.previous.json");

export async function GET() {
  try {
    const content = await readFile(statePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ state: null, updatedAt: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WorkspaceStateV2Payload;
    if (!body || body.state === undefined || body.state === null) {
      return NextResponse.json(
        { error: "Refusing to overwrite workspace state v2 with empty state" },
        { status: 400 }
      );
    }

    await mkdir(path.dirname(statePath), { recursive: true });
    try {
      await copyFile(statePath, backupPath);
    } catch {
      // No previous state yet.
    }

    await writeFile(
      statePath,
      JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          state: body.state,
        },
        null,
        2
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save workspace state v2" },
      { status: 500 }
    );
  }
}

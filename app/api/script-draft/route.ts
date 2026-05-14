import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

type DraftPayload = {
  scripts: Record<string, string>;
};

const draftPath = path.join(process.cwd(), "data", "script-draft.json");
const backupPath = path.join(process.cwd(), "data", "script-draft.previous.json");

export async function GET() {
  try {
    const content = await readFile(draftPath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ scripts: {}, updatedAt: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DraftPayload;
    const scripts = body.scripts ?? {};
    if (Object.keys(scripts).length === 0) {
      return NextResponse.json(
        { error: "Refusing to overwrite draft with empty scripts" },
        { status: 400 }
      );
    }

    await mkdir(path.dirname(draftPath), { recursive: true });
    try {
      await copyFile(draftPath, backupPath);
    } catch {
      // No previous draft yet.
    }
    await writeFile(
      draftPath,
      JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          scripts,
        },
        null,
        2
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}

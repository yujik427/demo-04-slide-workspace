import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, WORKSPACE_ROW_ID } from "@/lib/supabase";

type DraftPayload = {
  scripts: Record<string, string>;
};

const TABLE = "script_draft";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .select("scripts, updated_at")
      .eq("id", WORKSPACE_ROW_ID)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ scripts: {}, updatedAt: null });

    return NextResponse.json({
      scripts: data.scripts ?? {},
      updatedAt: data.updated_at,
    });
  } catch (error) {
    return NextResponse.json(
      {
        scripts: {},
        updatedAt: null,
        error: error instanceof Error ? error.message : "Failed to load",
      },
      { status: 200 }
    );
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

    const supabase = getSupabaseAdmin();

    // humanize 前を previous_scripts に退避する仕組み（既存と同じ挙動）
    const { data: current } = await supabase
      .from(TABLE)
      .select("scripts")
      .eq("id", WORKSPACE_ROW_ID)
      .maybeSingle();

    const { error } = await supabase.from(TABLE).upsert({
      id: WORKSPACE_ROW_ID,
      scripts,
      previous_scripts: current?.scripts ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}

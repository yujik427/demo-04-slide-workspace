import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, WORKSPACE_ROW_ID } from "@/lib/supabase";

type WorkspaceStateV2Payload = {
  state?: unknown;
};

const TABLE = "workspace_state_v2";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .select("state, updated_at")
      .eq("id", WORKSPACE_ROW_ID)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ state: null, updatedAt: null });

    return NextResponse.json({
      state: data.state,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    return NextResponse.json(
      {
        state: null,
        updatedAt: null,
        error: error instanceof Error ? error.message : "Failed to load",
      },
      { status: 200 }
    );
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

    const supabase = getSupabaseAdmin();

    // 現在の state を previous_state に退避してから新しい state を保存する
    // （ローカル時代の workspace-state-v2.previous.json と同じ役割）
    const { data: current } = await supabase
      .from(TABLE)
      .select("state")
      .eq("id", WORKSPACE_ROW_ID)
      .maybeSingle();

    const { error } = await supabase.from(TABLE).upsert({
      id: WORKSPACE_ROW_ID,
      state: body.state,
      previous_state: current?.state ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save workspace state v2" },
      { status: 500 }
    );
  }
}

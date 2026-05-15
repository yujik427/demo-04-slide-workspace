/**
 * Pipeline Diagram — Addness Slide Studio の AI 連鎖図
 *
 * 提出ドキュメント②（submission-doc.md）の §4.1 に貼る画像。
 * 本システムのスライド生成と同じ手法（HTML→PNG）で作図することで、
 * ドキュメント全体に「HTML→PNG が芯」という思想一貫性を出す。
 *
 * 配色: bootcamp テーマ（#0A0E27 / #F5F5F7 / #FF6B35）
 */

const BG = "#0A0E27";
const FG = "#F5F5F7";
const ACCENT = "#FF6B35";
const MUTED = "#8B92B5";
const CARD = "#141A3A";
const BORDER = "#2A335E";

type ActorKind = "user" | "claude-code" | "api";

const ACTOR_META: Record<ActorKind, { label: string; color: string }> = {
  user: { label: "USER", color: "#8B92B5" },
  "claude-code": { label: "CLAUDE CODE", color: "#FF6B35" },
  api: { label: "API ROUTE", color: "#FF6B35" },
};

function StepCard({
  actor,
  title,
  detail,
  steps,
  badge,
}: {
  actor: ActorKind;
  title: string;
  detail?: string;
  steps?: { label: string; tool?: string }[];
  badge?: string;
}) {
  const meta = ACTOR_META[actor];
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "20px 28px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            color: meta.color,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          {meta.label}
        </span>
        {badge && (
          <span
            style={{
              background: ACCENT,
              color: BG,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 4,
              letterSpacing: "0.05em",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        style={{
          color: FG,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.35,
          marginBottom: detail || steps ? 10 : 0,
        }}
      >
        {title}
      </div>
      {detail && (
        <div
          style={{
            color: MUTED,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {detail}
        </div>
      )}
      {steps && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                fontSize: 14,
              }}
            >
              <span
                style={{
                  color: ACCENT,
                  fontWeight: 700,
                  minWidth: 22,
                }}
              >
                {`${i + 1}.`}
              </span>
              <span style={{ color: FG, flex: 1 }}>{s.label}</span>
              {s.tool && (
                <span
                  style={{
                    color: MUTED,
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                >
                  {s.tool}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <div
      style={{
        height: 32,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width="14" height="32" viewBox="0 0 14 32" fill="none">
        <line x1="7" y1="0" x2="7" y2="22" stroke={ACCENT} strokeWidth="2" />
        <polygon points="0,22 14,22 7,32" fill={ACCENT} />
      </svg>
    </div>
  );
}

export function PipelineDiagram() {
  return (
    <div
      id="pipeline-diagram"
      style={{
        background: BG,
        color: FG,
        width: 1080,
        padding: "60px 64px 72px",
        fontFamily:
          '"Inter", "Noto Sans JP", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            color: ACCENT,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.25em",
            marginBottom: 12,
          }}
        >
          ADDNESS SLIDE STUDIO — PROMPT CHAIN ARCHITECTURE
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          プロンプト連鎖・<br />
          エージェント構成
        </h1>
        <div
          style={{
            marginTop: 14,
            color: MUTED,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          テーマ → セクション・原稿生成 → 原稿編集 → スライド生成 までを1画面で扱う。<br />
          AI 呼び出しは「原稿生成層」「スライド生成層」の2層構造。
        </div>
      </div>

      {/* Flow */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <StepCard
          actor="user"
          title="1区: テーマ作成"
          detail="セッションのテーマを定義する起点。"
        />
        <Arrow />

        <StepCard
          actor="user"
          title="2区: セクション作成"
          detail="セクション単位で原稿を作る。「原稿生成」を実行すると、Claude Code が起動する。"
        />
        <Arrow />

        <StepCard
          actor="claude-code"
          title="script-pipeline スキル起動"
          badge="原稿生成層"
          steps={[
            { label: "grill-me で原稿方針を対話ヒアリング", tool: "Claude" },
            { label: "Claude が販売原稿を執筆", tool: "Claude" },
            { label: "humanize-inline で AI 臭リライト", tool: "Skill" },
            { label: "POST /api/script-draft で保存", tool: "Next.js" },
          ]}
        />
        <Arrow />

        <StepCard
          actor="user"
          title="3区: 原稿編集・スライド数決定"
          detail="生成された原稿を確認・編集し、このセクションを何枚のスライドにするかを決める。"
        />
        <Arrow />

        <StepCard
          actor="user"
          title="4区: テンプレ／配色テーマ設定"
          detail="スライド共通のテンプレートと配色テーマ（bootcamp / lecture）を選ぶ。"
        />
        <Arrow />

        <StepCard
          actor="api"
          title="POST /api/regenerate-slide"
          badge="スライド生成層"
          detail="セクション × スライド数の回数だけループ実行。1リクエスト = 1スライド。"
          steps={[
            {
              label: "Claude Opus 4.7 で image-design JSON を生成",
              tool: "Anthropic",
            },
            {
              label: "OpenAI gpt-image-2 で 1536×1024 PNG を生成",
              tool: "OpenAI",
            },
            {
              label: "PNG ＋ image-design.json をペア保存（再現性担保）",
              tool: "fs",
            },
          ]}
        />
        <Arrow />

        <StepCard
          actor="user"
          title="プレビュー → 採用判断 → ダウンロード"
          detail="生成スライドを並べて確認し、採用版だけ書き出す。"
        />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          color: MUTED,
          fontSize: 12,
        }}
      >
        <span>Generated by HTML → PNG (Playwright)</span>
        <span style={{ color: ACCENT, fontWeight: 700 }}>
          Yuji Kubo / Addness Application
        </span>
      </div>
    </div>
  );
}

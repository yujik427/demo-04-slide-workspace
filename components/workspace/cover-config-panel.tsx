"use client";

export type CoverData = {
  catchBand: string;
  title: string;
  subtitle: string;
  personCharacterId: string | null;
  pixelCharacterId: string | null;
  colorPresetId: "claude-dark" | "claude-light";
  toolLogoId: string;
};

export const DEFAULT_COVER_DATA: CoverData = {
  catchBand: "プログラミング未経験から、7日でAIシステムが1本完成する。",
  title: "Claude Code\nブートキャンプ",
  subtitle: "未経験7日で成果物1本",
  personCharacterId: null,
  pixelCharacterId: null,
  colorPresetId: "claude-dark",
  toolLogoId: "claude-code",
};

type Props = {
  data: CoverData;
  onChange: (next: CoverData) => void;
  onExportPng: () => void;
  isExporting: boolean;
};

const PRESET_OPTIONS: Array<{ id: CoverData["colorPresetId"]; label: string; swatch: string }> = [
  { id: "claude-dark", label: "ダーク (claude-dark)", swatch: "#0a0e27" },
  { id: "claude-light", label: "ライト (claude-light)", swatch: "#faf9f5" },
];

// プレースホルダ用候補(画像生成後に index.json で置き換える前提)
const PERSON_CHARACTERS = [
  { id: null, label: "未設定" },
  { id: "person-01", label: "person-01 (生成待ち)" },
  { id: "person-02", label: "person-02 (生成待ち)" },
  { id: "person-03", label: "person-03 (生成待ち)" },
];

const PIXEL_CHARACTERS = [
  { id: null, label: "未設定" },
  { id: "pixel-01", label: "pixel-01 (生成待ち)" },
  { id: "pixel-02", label: "pixel-02 (生成待ち)" },
];

export function CoverConfigPanel({ data, onChange, onExportPng, isExporting }: Props) {
  const update = <K extends keyof CoverData>(key: K, value: CoverData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="grid gap-3.5 overflow-y-auto pr-1">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <div className="mb-2 text-[12px] font-black tracking-wide text-amber-700">
          表紙設定 (1枚目のみ)
        </div>
        <p className="text-[11px] leading-[1.6] text-amber-800">
          ここで操作した値は、右下プレビューに即座に反映されます。完成したら下の「PNG出力」で画像化。
        </p>
      </div>

      {/* キャッチ帯 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <label className="mb-2 block text-[13px] font-black text-slate-700">
          黄色キャッチ帯の文言
        </label>
        <textarea
          value={data.catchBand}
          onChange={(e) => update("catchBand", e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[12px] leading-[1.5] focus:border-amber-400 focus:outline-none"
          placeholder="プログラミング未経験から、7日でAIシステムが1本完成する。"
        />
        <p className="mt-1 text-[10px] text-slate-400">
          {data.catchBand.length} 字 (推奨: 30字前後)
        </p>
      </div>

      {/* 大タイトル */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <label className="mb-2 block text-[13px] font-black text-slate-700">大タイトル</label>
        <textarea
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[14px] font-bold leading-[1.3] focus:border-amber-400 focus:outline-none"
          placeholder="Claude Code\nブートキャンプ"
        />
        <p className="mt-1 text-[10px] text-slate-400">改行で2行になります</p>
      </div>

      {/* サブテキスト */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <label className="mb-2 block text-[13px] font-black text-slate-700">サブテキスト</label>
        <input
          type="text"
          value={data.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[12px] focus:border-amber-400 focus:outline-none"
          placeholder="未経験7日で成果物1本"
        />
      </div>

      {/* 配色プリセット */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="mb-2 text-[13px] font-black text-slate-700">配色プリセット</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_OPTIONS.map((opt) => {
            const selected = data.colorPresetId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update("colorPresetId", opt.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[12px] font-extrabold transition-colors ${
                  selected
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className="inline-block h-4 w-4 rounded border border-slate-300"
                  style={{ background: opt.swatch }}
                />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 人物キャラ選択 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="mb-2 text-[13px] font-black text-slate-700">人物キャラ</div>
        <div className="grid grid-cols-2 gap-2">
          {PERSON_CHARACTERS.map((char) => {
            const selected = data.personCharacterId === char.id;
            return (
              <button
                key={char.id ?? "none"}
                type="button"
                onClick={() => update("personCharacterId", char.id)}
                className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-extrabold transition-colors ${
                  selected
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {char.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          画像生成後、public/characters/person/ に配置して有効化
        </p>
      </div>

      {/* ピクセルキャラ選択 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="mb-2 text-[13px] font-black text-slate-700">ピクセルキャラ</div>
        <div className="grid grid-cols-3 gap-2">
          {PIXEL_CHARACTERS.map((char) => {
            const selected = data.pixelCharacterId === char.id;
            return (
              <button
                key={char.id ?? "none"}
                type="button"
                onClick={() => update("pixelCharacterId", char.id)}
                className={`rounded-lg border px-2 py-2 text-center text-[11px] font-extrabold transition-colors ${
                  selected
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {char.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PNG出力 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <button
          type="button"
          onClick={onExportPng}
          disabled={isExporting}
          className="w-full min-h-[44px] rounded-lg bg-amber-500 text-[13px] font-extrabold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
        >
          {isExporting ? "出力中..." : "表紙をPNGで保存"}
        </button>
        <p className="mt-2 text-[10px] leading-[1.5] text-slate-400">
          現在のプレビューを 1920×1080 のPNG画像として書き出します
        </p>
      </div>
    </div>
  );
}

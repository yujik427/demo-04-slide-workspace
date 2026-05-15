export type SlideType =
  | "cover"
  | "problem"
  | "tool"
  | "instructor"
  | "curriculum"
  | "bonuses"
  | "value_compare"
  | "objections"
  | "cta"
  | string;

export type Slide = {
  index: number;
  type: SlideType;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  highlight?: string | null;
  highlight_suffix?: string | null;
  body: string[];
  footer?: string | null;
  cta?: string | null;

  // === 表紙(cover)専用フィールド ===
  /** 黄色キャッチ帯の文言 */
  catchBand?: string | null;
  /** 人物キャラID(public/characters/person/{id}.png) */
  personCharacterId?: string | null;
  /** ピクセルキャラID(public/characters/pixel/{id}.png) */
  pixelCharacterId?: string | null;
  /** 配色プリセットID "claude-dark" | "claude-light" 等 */
  colorPresetId?: string | null;
  /** ツールロゴID "claude-code" 単独想定 */
  toolLogoId?: string | null;
};

export type DeckMetadata = {
  title: string;
  audience?: string;
  tone?: string;
  theme?: string;
};

export type Deck = {
  metadata: DeckMetadata;
  slides: Slide[];
};

export type ProjectBrief = {
  name: string;
  product: string;
  purpose: string;
  audience: string;
  tone: string;
  deckName: string;
  status: string;
};

export type SourceDraft = {
  title: string;
  status: "drafting" | "ready" | "needs_review";
  sections: Array<{
    heading: string;
    body: string;
    signals: string[];
  }>;
};

export type ExtractedPartKind =
  | "appeal"
  | "proof"
  | "number"
  | "objection"
  | "cta"
  | "visual";

export type ExtractedPart = {
  id: string;
  kind: ExtractedPartKind;
  label: string;
  source: string;
  slideText: string;
  targetSlideIndexes: number[];
  status: "auto" | "edited" | "needs_review";
};

export type SlidePlanItem = {
  slideIndex: number;
  role: string;
  partIds: string[];
  visualPrompt?: string;
};

export type SlideWorkspaceData = {
  brief: ProjectBrief;
  sourceDraft: SourceDraft;
  extractedParts: ExtractedPart[];
  slidePlan: SlidePlanItem[];
};

export type EditableSlideField =
  | "type"
  | "title"
  | "subtitle"
  | "highlight"
  | "highlight_suffix"
  | "body"
  | "footer";

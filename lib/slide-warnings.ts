import type { Slide } from "@/lib/slide-types";

export type SlideWarningLevel = "ok" | "notice" | "warning";

export type SlideWarning = {
  field: "title" | "highlight" | "body";
  level: SlideWarningLevel;
  label: string;
  message: string;
};

const LIMITS = {
  title: 34,
  highlight: 12,
  bodyLine: 34,
  bodyLines: 3
};

function judgeLength(length: number, limit: number) {
  if (length <= Math.floor(limit * 0.85)) return "ok";
  if (length <= limit) return "notice";
  return "warning";
}

export function getSlideWarnings(slide: Slide): SlideWarning[] {
  const titleLevel = judgeLength(slide.title.length, LIMITS.title);
  const highlightLength = `${slide.highlight ?? ""}${slide.highlight_suffix ?? ""}`.length;
  const highlightLevel = highlightLength === 0 ? "ok" : judgeLength(highlightLength, LIMITS.highlight);
  const longestBodyLine = Math.max(0, ...slide.body.map((line) => line.length));
  const bodyLevel =
    slide.body.length > LIMITS.bodyLines || longestBodyLine > LIMITS.bodyLine
      ? "warning"
      : slide.body.length === LIMITS.bodyLines || longestBodyLine > Math.floor(LIMITS.bodyLine * 0.85)
        ? "notice"
        : "ok";

  return [
    {
      field: "title",
      level: titleLevel,
      label: titleLevel === "warning" ? "長い" : titleLevel === "notice" ? "やや長い" : "適正",
      message: `title ${slide.title.length}/${LIMITS.title}字`
    },
    {
      field: "highlight",
      level: highlightLevel,
      label: highlightLevel === "warning" ? "長い" : highlightLevel === "notice" ? "やや長い" : "適正",
      message:
        highlightLength === 0
          ? "highlight なし"
          : `highlight ${highlightLength}/${LIMITS.highlight}字`
    },
    {
      field: "body",
      level: bodyLevel,
      label: bodyLevel === "warning" ? "圧迫" : bodyLevel === "notice" ? "多め" : "適正",
      message: `body ${slide.body.length}/${LIMITS.bodyLines}行、最長${longestBodyLine}/${LIMITS.bodyLine}字`
    }
  ];
}

export function hasBlockingWarning(slide: Slide) {
  return getSlideWarnings(slide).some((warning) => warning.level === "warning");
}

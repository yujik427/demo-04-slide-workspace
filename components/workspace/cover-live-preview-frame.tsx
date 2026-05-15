"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  html: string;
};

/**
 * 表紙のライブプレビュー。
 *
 * 1920×1080 で書き出した HTML を、親枠の実幅に合わせて transform:scale で縮小表示する。
 * 親枠がリサイズされたら ResizeObserver で再計算。
 */
export function CoverLivePreviewFrame({ html }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / 1920);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <iframe
        title="cover-live-preview"
        srcDoc={html}
        className="origin-top-left border-0"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

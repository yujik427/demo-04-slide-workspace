import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slide Workspace",
  description: "4ペインでスライド生成工程を扱う作業場"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

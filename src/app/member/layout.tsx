import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "会員ページ | チヨダエステート株式会社",
  description:
    "チヨダエステート会員専用ページ。物件リクエストの送信・履歴確認が可能です。",
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

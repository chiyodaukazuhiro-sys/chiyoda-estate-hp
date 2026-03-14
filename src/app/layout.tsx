import type { Metadata } from "next";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "チヨダエステート株式会社 | 大阪の不動産売買・賃貸仲介",
  description:
    "大阪市西区の不動産会社チヨダエステート。金融機関・士業・医療関係の皆さまとの連携を強みに、専門性の高い不動産ニーズに応える売買仲介・コンサルティング。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Shippori+Mincho:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={isAdmin ? "antialiased" : "antialiased flex flex-col min-h-screen"}>
        {!isAdmin && <Header />}
        {isAdmin ? children : <main className="flex-1">{children}</main>}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}

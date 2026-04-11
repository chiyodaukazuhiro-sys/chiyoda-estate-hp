import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "チヨダ秘書",
  description: "チヨダエステート AI秘書アシスタント",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "チヨダ秘書",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.log('SW registration failed:', err);
                });
              });
            }
          `,
        }}
      />
      <div style={{ backgroundColor: "#0f0f1e", minHeight: "100dvh" }}>
        {children}
      </div>
    </>
  );
}

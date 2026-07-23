import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://benfica-eternal-draft.pdassi.chatgpt.site"),
  title: {
    default: "Benfica Legends Draft — Onze lendas, uma Europa eterna",
    template: "%s · Benfica Legends Draft",
  },
  description:
    "Escolhe um onze de 100 lendas do Benfica e disputa uma Champions Legends contra campeões europeus de todas as eras.",
  applicationName: "Benfica Legends Draft",
  keywords: ["Benfica", "draft", "futebol", "lendas", "Champions Legends"],
  category: "game",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Benfica Legends Draft",
    title: "Onze lendas. Uma Europa eterna.",
    description:
      "Faz o teu XI de lendas do Benfica e enfrenta os campeões europeus de todas as eras.",
    images: [
      {
        url: "/assets/benfica-current.png",
        width: 250,
        height: 246,
        alt: "Emblema do Sport Lisboa e Benfica",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Benfica Legends Draft",
    description: "Onze lendas. Uma Europa eterna. Constrói o teu XI.",
    images: ["/assets/benfica-current.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Legends Draft",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/legends-icon.svg",
    shortcut: "/legends-icon.svg",
    apple: "/assets/benfica-current.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#171613",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsToken =
    process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN ??
    "85900819284b43ca9ff37bebcbf5202d";
  return (
    <html lang="pt-PT">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {analyticsToken ? (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}

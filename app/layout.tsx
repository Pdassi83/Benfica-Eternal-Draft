import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Benfica Eternal Draft — Onze lendas, uma Europa eterna",
    template: "%s · Benfica Eternal Draft",
  },
  description:
    "Escolhe um onze de 100 lendas do Benfica e disputa uma Champions Eternal contra campeões europeus de todas as eras.",
  applicationName: "Benfica Eternal Draft",
  keywords: ["Benfica", "draft", "futebol", "lendas", "Champions Eternal"],
  category: "game",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Benfica Eternal Draft",
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
    title: "Benfica Eternal Draft",
    description: "Onze lendas. Uma Europa eterna. Constrói o teu XI.",
    images: ["/assets/benfica-current.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Eternal Draft",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/eternal-icon.svg",
    shortcut: "/eternal-icon.svg",
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
  return (
    <html lang="pt-PT">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

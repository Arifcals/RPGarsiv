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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rpgarsiv.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efefe8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RPG Arşiv - Türkçe TRPG Sistem Çevirileri ve Rehberleri",
    template: "%s | RPG Arşiv",
  },
  description:
    "RPG Arşiv, yabancı dili zayıf TRPG oyuncuları için masaüstü rol yapma oyunu sistemlerinin yüksek doğruluklu Türkçe çevirilerini sunar. Call of Cthulhu, The End of The World ve daha fazlası!",
  keywords: [
    "TRPG",
    "masa üstü rol yapma oyunu",
    "RPG çeviri",
    "Türkçe RPG",
    "D&D Türkçe",
    "Dungeons and Dragons",
    "Call of Cthulhu",
    "The End of The Worlds RPG",
    "rol yapma oyunu",
    "TRPG rehber",
    "RPG kuralları",
    "masa üstü oyun",
    "tabletop RPG",
    "RPG Arşiv",
  ],
  authors: [{ name: "RPG Arşiv" }],
  creator: "RPG Arşiv",
  publisher: "RPG Arşiv",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "RPG Arşiv",
    title: "RPG Arşiv - Türkçe TRPG Sistem Çevirileri ve Rehberleri",
    description:
      "Yabancı dili zayıf TRPG oyuncuları için masaüstü rol yapma oyunu sistemlerinin yüksek doğruluklu Türkçe çevirileri. Call of Cthulhu, The End of The World ve daha fazlası!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RPG Arşiv - Türkçe TRPG Çevirileri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RPG Arşiv - Türkçe TRPG Sistem Çevirileri",
    description:
      "Masaüstü rol yapma oyunu sistemlerinin yüksek doğruluklu Türkçe çevirileri. Call of Cthulhu, The End of The World ve daha fazlası!",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "games",
  classification: "Tabletop Role-Playing Games",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RPG Arşiv",
  description: "Türkçe TRPG sistem çevirileri ve rehberleri. Masaüstü rol yapma oyunları için kapsamlı Türkçe kaynak.",
  url: siteUrl,
  inLanguage: "tr-TR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "RPG Arşiv",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}

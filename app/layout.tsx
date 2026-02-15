import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "QWEN Restaurant - Premium Artisanal Coffee & Gourmet Cuisine",
    template: "%s | QWEN Restaurant"
  },
  description: "Experience luxury dining at QWEN. Enjoy the finest artisanal coffee, handcrafted pastries, and gourmet cuisine delivered with elegance. Order online now.",
  keywords: ['restaurant', 'coffee', 'gourmet', 'luxury dining', 'artisanal', 'Tokyo', 'Japanese cuisine', 'pastries', 'desserts', 'online ordering'],
  authors: [{ name: 'QWEN Restaurant' }],
  creator: 'QWEN Restaurant',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://qwen.restaurant'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'QWEN Restaurant',
    title: 'QWEN Restaurant - Premium Artisanal Coffee & Gourmet Cuisine',
    description: 'Experience luxury dining at QWEN. Enjoy the finest artisanal coffee, handcrafted pastries, and gourmet cuisine delivered with elegance.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'QWEN Restaurant - Luxury Dining Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QWEN Restaurant - Premium Artisanal Coffee & Gourmet Cuisine',
    description: 'Experience luxury dining at QWEN. Enjoy the finest artisanal coffee, handcrafted pastries, and gourmet cuisine.',
    images: ['/og-image.svg'],
    creator: '@qwenrestaurant',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

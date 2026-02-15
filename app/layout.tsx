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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QWEN Restaurant',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 414px) and (device-height: 896px)',
      },
    ],
  },
  applicationName: 'QWEN Restaurant',
  formatDetection: {
    telephone: false,
  },
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
    { media: '(prefers-color-scheme: dark)', color: '#D4AF37' },
  ],
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-icon-120x120.svg', sizes: '120x120', type: 'image/svg+xml' },
      { url: '/icons/apple-icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
      { url: '/icons/apple-icon-180x180.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="QWEN Restaurant" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QWEN" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#D4AF37" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-icon-120x120.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.svg" />
        
        {/* Splash Screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

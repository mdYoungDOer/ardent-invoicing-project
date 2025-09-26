import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MUIProvider } from "@/components/theme/MUIProvider";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ardent Invoicing - Invoice & Expense Management for Ghanaian SMEs",
  description: "Empower your Ghanaian SME with professional invoicing, expense tracking, and financial management. Invoice in GHS, track expenses seamlessly, and get paid faster.",
  keywords: "invoicing, expense management, Ghana, SME, GHS, accounting, business",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', url: '/favicon.png', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  robots: 'index, follow',
  openGraph: {
    title: 'Ardent Invoicing - Professional Invoicing for Ghanaian SMEs',
    description: 'Streamline your business finances with professional invoicing, expense tracking, and payment management. Built specifically for Ghanaian businesses.',
    type: 'website',
    locale: 'en_GH',
    siteName: 'Ardent Invoicing',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'Ardent Invoicing Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ardent Invoicing - Professional Invoicing for Ghanaian SMEs',
    description: 'Streamline your business finances with professional invoicing, expense tracking, and payment management.',
    images: ['/favicon.png']
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#a67c00'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#a67c00" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} id="__next">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MUIProvider>
            {children}
            <CookieConsent />
          </MUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

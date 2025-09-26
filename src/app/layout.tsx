import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MUIProvider } from "@/components/theme/MUIProvider";
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
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MUIProvider>
            {children}
          </MUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

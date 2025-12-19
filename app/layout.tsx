import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartProvider from '@/components/CartProvider'
import NavBar from '@/components/NavBar'
import Providers from './providers'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pharmacy Platform",
  description: "Pharmacy Management & E-Commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="pharmacy-theme"
        >
          <Providers>
            <CartProvider>
              <NavBar />
              {children}
              <Toaster richColors position="top-right" />
            </CartProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

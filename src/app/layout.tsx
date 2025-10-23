import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Health Rehab - Your Personal Recovery Journey",
  description:
    "Track your cervical lordosis recovery with personalized exercise routines, pain tracking, and progress monitoring.",
  keywords: [
    "health",
    "rehabilitation",
    "cervical lordosis",
    "exercise tracking",
    "pain management",
    "recovery",
  ],
  authors: [{ name: "Health Rehab Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          manrope.variable,
          inter.variable,
          "font-sans antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}

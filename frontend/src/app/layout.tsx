import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustWrite – Complete Writing Intelligence & Verification Workspace",
  description: "Write Better. Verify More. Communicate with Confidence. TrustWrite is an AI-powered writing intelligence platform for grammar, readability, citations, and ethical AI signals.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900`}
      >
        {children}
      </body>
    </html>
  );
}

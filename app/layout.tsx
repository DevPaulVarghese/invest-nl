import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/invest-nl/site-footer";
import { SiteHeader } from "@/components/invest-nl/site-header";
import { LicenseGuard } from "@/components/invest-nl/license-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decision Lab",
  description:
    "Structured framework to evaluate AI-for-good investments with ESG, financial, and risk scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="TECH"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('dd-color-mode');if(m===null||m==='dark')document.documentElement.classList.add('dark');var t=localStorage.getItem('dd-ui-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <LicenseGuard>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <SiteFooter />
        </LicenseGuard>
      </body>
    </html>
  );
}

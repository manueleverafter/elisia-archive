import type { Metadata, Viewport } from "next";
import { Fraunces, Gochi_Hand, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { themeInitScript } from "@/lib/themes";
import "./globals.css";

const body = Outfit({ variable: "--nf-body", subsets: ["latin"] });
const display = Fraunces({ variable: "--nf-display", subsets: ["latin"] });
const hand = Gochi_Hand({ variable: "--nf-hand", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} · fan archive`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1418" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={siteConfig.defaultTheme}
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${hand.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <div aria-hidden className="page-glow pointer-events-none fixed inset-0 -z-10" />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

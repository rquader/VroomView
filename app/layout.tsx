import type { Metadata } from "next";
import { ViewTransition, type ReactNode } from "react";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/constants/app";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
  display: "swap",
});
const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
};

// Applies the saved theme before first paint (no flash). Default: vellum.
const THEME_INIT =
  "try{var t=localStorage.getItem('vv-theme')||'vellum';document.documentElement.dataset.theme=['vellum','moss','clay','graphite'].includes(t)?t:'vellum'}catch(e){document.documentElement.dataset.theme='vellum'}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {/* keyboard users skip the masthead straight to the page's content */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {/* route changes crossfade (View Transitions API); browsers without
              it — and reduced-motion users, via globals.css — navigate
              instantly. The masthead stays outside so it never re-fades. */}
          <ViewTransition>{children}</ViewTransition>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}

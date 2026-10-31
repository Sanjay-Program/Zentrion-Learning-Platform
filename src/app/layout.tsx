import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Shell } from "@/components/layout";
import { ToastProvider } from "@/components/interactive";
import { OrganizationJsonLd } from "@/components/seo-schema";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zentrion Learntech — AI, Skills & Cybersecurity Learning Platform",
    template: "%s | Zentrion Learntech",
  },
  description:
    "Learn AI, prompt engineering, agentic AI, application development and cybersecurity through structured courses, hands-on labs, projects and live instruction.",
  metadataBase: new URL(process.env.APP_BASE_URL || "https://zentrion.dev"),
  openGraph: {
    type: "website",
    siteName: "Zentrion Learntech",
    title: "Zentrion Learntech",
    description: "Integrated AI and practical-skills learning platform.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/logo/08-app-icon-favicon.svg",
    shortcut: "/images/logo/08-app-icon-favicon.svg",
    apple: "/images/logo/08-app-icon-favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b3bf0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zentn-theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <OrganizationJsonLd />
        <a href="#main" className="skip-link">Skip to content</a>
        <ToastProvider>
          <Shell>{children}</Shell>
        </ToastProvider>
      </body>
    </html>
  );
}

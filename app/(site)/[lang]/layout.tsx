import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from '@/components/Header';

// Configuração de fontes globais
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Metadados globais
export const metadata: Metadata = {
  title: "GoalMetric - Football Predictions",
  description: "Football predictions, statistics, betting insights and match analysis.",
  icons: {
    icon: "/favicon.ico",
  },
};

function getHtmlLang(lang: string): string {
  const map: Record<string, string> = {
    br: "pt-BR",
    en: "en",
    es: "es",
    fr: "fr",
  };
  return map[lang] || "en";
}

// Layout principal
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const currentLang = getHtmlLang(lang);

  return (
    <html lang={currentLang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} text-white bg-zinc-950 antialiased`}>
        <div className="flex min-h-screen">
          <Header />
          
          {/* Sidebar agora recebe a prop lang */}
          <Sidebar lang={lang} />
          
          <div className="flex-1 lg:ml-72 min-h-screen pt-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
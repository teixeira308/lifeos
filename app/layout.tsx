import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TideOS",
  description: "Sistema operacional pessoal baseado na metodologia Vida em M.",
  manifest: "/manifest.json",
  icons: {
    apple: "/logo-only.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning style={{ backgroundColor: '#0B0C10' }}>
      <body className={`${jetbrainsMono.variable} antialiased bg-background`} style={{ backgroundColor: '#0B0C10' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

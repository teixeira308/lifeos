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
    apple: "/logo-icon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning style={{ backgroundColor: '#01030C' }}>
      <body className={`${jetbrainsMono.variable} antialiased bg-background`} style={{ backgroundColor: '#01030C' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

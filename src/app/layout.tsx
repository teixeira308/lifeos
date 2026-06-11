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
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

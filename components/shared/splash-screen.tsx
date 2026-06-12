"use client";

import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
      <div className="animate-splash-glow">
        <Image
          src="/logo-nome-abaixo.png"
          alt="TideOS"
          width={160}
          height={87}
          priority
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

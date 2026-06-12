"use client";

import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
      <Image
        src="/logo-only.png"
        alt="tideOS"
        width={320}
        height={174}
        priority
      />
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
        <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

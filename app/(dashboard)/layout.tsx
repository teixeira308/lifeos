"use client";

import { Suspense } from "react";
import Image from "next/image";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SplashScreen } from "@/components/shared/splash-screen";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <Suspense fallback={
        <div className="flex h-svh items-center justify-center">
          <Skeleton className="h-full w-64 rounded-none" />
          <div className="flex-1 p-8">
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      }>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Image src="/logo-only.png" alt="tideOS" width={60} height={33} priority className="hidden md:block" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <PageWrapper>{children}</PageWrapper>
            </Suspense>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

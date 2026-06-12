export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
}

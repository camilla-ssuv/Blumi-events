import { Navbar } from "@/components/navbar";

export function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

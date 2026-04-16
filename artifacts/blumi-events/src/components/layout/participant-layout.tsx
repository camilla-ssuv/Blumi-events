import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const { setRole } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setRole(null);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="bg-[#314C5D] text-white h-20 px-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold font-heading text-2xl">blūmi events</Link>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-medium hidden sm:block">João Participante</span>
            <div className="w-10 h-10 rounded-full bg-[#DEFF66] text-[#314C5D] flex items-center justify-center font-bold text-lg">
              JP
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-white border-white/20 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

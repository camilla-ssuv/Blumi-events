import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { setRole } = useAuth();
  const [, setLocation] = useLocation();

  const handleAdmin = () => {
    setRole("admin");
    setLocation("/admin/eventos/evt-1");
  };

  const handleParticipant = () => {
    setRole("participant");
    setLocation("/minha-area");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-heading font-extrabold text-[#314C5D] mb-4">blūmi events</h1>
        <p className="text-[#314C5D]/70 text-lg">Plataforma de gestão de eventos</p>
      </div>

      <Card className="w-full max-w-md border-0 shadow-xl bg-white">
        <CardContent className="p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-heading font-bold text-center text-foreground mb-4">Simulação de Login</h2>
          
          <Button 
            onClick={handleAdmin}
            className="w-full h-14 text-lg bg-[#314C5D] hover:bg-[#314C5D]/90 text-white rounded-xl"
          >
            Entrar como Admin
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          
          <Button 
            onClick={handleParticipant}
            className="w-full h-14 text-lg bg-[#DEFF66] hover:bg-[#c9eb55] text-[#314C5D] font-bold rounded-xl"
          >
            Entrar como Participante
          </Button>

          <Button 
            variant="outline"
            onClick={() => setLocation("/eventos")}
            className="w-full mt-4"
          >
            Explorar catálogo de eventos
          </Button>

          <Button 
            variant="outline"
            onClick={() => setLocation("/eventos/imersao-quantdev-xp")}
            className="w-full"
          >
            Ver página pública do evento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

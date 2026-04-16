import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { role, setRole } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isParticipant = role === "participant";
  const isAdmin = role === "admin";
  const isLoggedIn = isParticipant || isAdmin;

  const handleLogout = () => {
    setRole(null);
    setLocation("/eventos");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#314C5D] px-6 py-3.5 flex items-center justify-between relative z-30">
      <button
        onClick={() => setLocation("/eventos")}
        className="text-white font-heading font-bold text-lg"
      >
        blūmi events
      </button>

      <div className="hidden sm:flex items-center gap-4">
        {isParticipant && (
          <button
            onClick={() => setLocation("/minha-area")}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Meus eventos
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setLocation("/admin/eventos/evt-1")}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Painel admin
          </button>
        )}
        {isLoggedIn ? (
          <>
            <div className="w-9 h-9 rounded-full bg-[#DEFF66] flex items-center justify-center text-[#314C5D] font-bold text-sm">
              {isAdmin ? "AD" : "AC"}
            </div>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Sair
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/")}
              className="px-4 py-2 border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => setLocation("/")}
              className="px-4 py-2 bg-[#DEFF66] text-[#314C5D] text-sm font-bold rounded-lg hover:bg-[#c9eb55] transition-colors"
            >
              Criar conta
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden text-white"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#314C5D] border-t border-white/10 p-4 space-y-3 sm:hidden z-50 shadow-xl">
          {isParticipant && (
            <button
              onClick={() => { setLocation("/minha-area"); setMenuOpen(false); }}
              className="block w-full text-left text-white/80 hover:text-white text-sm font-medium py-2"
            >
              Meus eventos
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => { setLocation("/admin/eventos/evt-1"); setMenuOpen(false); }}
              className="block w-full text-left text-white/80 hover:text-white text-sm font-medium py-2"
            >
              Painel admin
            </button>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left text-white/60 hover:text-white text-sm py-2"
            >
              Sair
            </button>
          ) : (
            <>
              <button
                onClick={() => { setLocation("/"); setMenuOpen(false); }}
                className="block w-full text-left text-white text-sm font-medium py-2"
              >
                Entrar
              </button>
              <button
                onClick={() => { setLocation("/"); setMenuOpen(false); }}
                className="block w-full text-left text-[#DEFF66] text-sm font-bold py-2"
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

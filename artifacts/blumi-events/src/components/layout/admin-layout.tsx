import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Users, LayoutDashboard, Menu, X, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setRole } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setRole(null);
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#314C5D] z-50 flex items-center justify-between px-4">
        <span className="text-white font-bold font-heading text-xl">blūmi events</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#314C5D] text-white
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 hidden lg:block">
          <span className="text-white font-bold font-heading text-2xl">blūmi events</span>
        </div>

        <nav className="flex-1 px-4 pt-16 lg:pt-4 space-y-2">
          <Link href="/admin/eventos/novo" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/10 text-white mb-6 bg-[#DEFF66] text-[#314C5D] font-semibold hover:bg-[#c9eb55]">
            <Plus size={20} />
            <span>Novo Evento</span>
          </Link>
          
          <Link href="/admin/eventos/evt-1" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-[#DEFF66] text-[#314C5D] font-medium">
            <Calendar size={20} />
            <span>Meus Eventos</span>
          </Link>
          
          <Link href="/admin/checkin/evt-1" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/10 text-white font-medium">
            <Users size={20} />
            <span>Check-in</span>
          </Link>
        </nav>

        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-0 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

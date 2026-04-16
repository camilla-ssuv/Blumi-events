import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { EventStoreProvider } from "@/hooks/use-event-store";
import Home from "@/pages/home";
import NewEvent from "@/pages/admin/new-event";
import EventDetail from "@/pages/admin/event-detail";
import CheckinPage from "@/pages/admin/checkin";
import EventPublic from "@/pages/event-public";
import SubeventPublic from "@/pages/subevent-public";
import EventCatalog from "@/pages/event-catalog";
import ParticipantArea from "@/pages/participant-area";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/eventos/novo" component={NewEvent} />
      <Route path="/admin/eventos/:id" component={EventDetail} />
      <Route path="/admin/checkin/:id" component={CheckinPage} />
      <Route path="/eventos" component={EventCatalog} />
      <Route path="/eventos/:eventSlug/:subSlug" component={SubeventPublic} />
      <Route path="/eventos/:slug" component={EventPublic} />
      <Route path="/minha-area" component={ParticipantArea} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <EventStoreProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </EventStoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

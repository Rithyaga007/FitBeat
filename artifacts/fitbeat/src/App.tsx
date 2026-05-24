import { supabase } from "./lib/supabase";
import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";

import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Activity from "@/pages/Activity";
import Workouts from "@/pages/Workouts";
import Health from "@/pages/Health";
import Recommendation from "@/pages/Recommendation";
import Goals from "@/pages/Goals";
import Brands from "@/pages/Brands";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/activity" component={Activity} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/health" component={Health} />
      <Route path="/recommendation" component={Recommendation} />
      <Route path="/goals" component={Goals} />
      <Route path="/brands" component={Brands} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>

          <Toaster />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;


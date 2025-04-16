
import * as React from "react"; 
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { AIProvider } from "@/contexts/AIContext";
import { DataProvider } from "@/contexts/DataContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OrganizationsPage from "./pages/OrganizationsPage";
import CreateOrganizationPage from "./pages/CreateOrganizationPage";
import OrganizationDetailsPage from "./pages/OrganizationDetailsPage";
import OrganizationProfilePage from "./pages/OrganizationProfilePage";
import CreateProposalPage from "./pages/CreateProposalPage";
import ProposalsPage from "./pages/ProposalsPage";
import ProposalDetailsPage from "./pages/ProposalDetailsPage";
import AgentPage from "./pages/AgentPage";
import UserProfilePage from "./pages/UserProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const isMobile = useIsMobile();
  
  // Add responsive meta viewport settings for mobile
  React.useEffect(() => {
    if (isMobile) {
      // Ensure proper mobile viewport settings
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
      }
    }
  }, [isMobile]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/organizations" element={<OrganizationsPage />} />
      <Route path="/organizations/create" element={<CreateOrganizationPage />} />
      <Route path="/organizations/:id" element={<OrganizationDetailsPage />} />
      <Route path="/organizations/:id/profile" element={<OrganizationProfilePage />} />
      <Route path="/organizations/:orgId/proposals/create" element={<CreateProposalPage />} />
      <Route path="/proposals" element={<ProposalsPage />} />
      <Route path="/proposals/:id" element={<ProposalDetailsPage />} />
      <Route path="/agent" element={<AgentPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <DataProvider>
          <AIProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AIProvider>
        </DataProvider>
      </WalletProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;

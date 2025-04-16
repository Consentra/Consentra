import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, PlusCircle, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Proposal } from "@/types";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/contexts/WalletContext";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const ProposalsPage = () => {
  const { proposals, isLoading, organizations } = useData();
  const { user } = useWallet();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  
  const filteredProposals = proposals.filter((proposal) => {
    // Apply search filter
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
                          
    // Apply status filter
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    
    // Apply organization filter
    const matchesOrg = orgFilter === "all" || proposal.organizationId === orgFilter;
    
    return matchesSearch && matchesStatus && matchesOrg;
  });
  
  // Sort proposals - active first, then pending, then others by creation date
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    // Status order: active > pending > passed > failed
    const statusOrder = { active: 0, pending: 1, passed: 2, failed: 3 };
    const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    
    if (statusDiff !== 0) return statusDiff;
    // For same status, sort by creation date (newer first)
    return b.createdAt - a.createdAt;
  });

  const handleCreateProposal = () => {
    // If there's only one organization, navigate directly to create proposal page
    if (organizations.length === 1) {
      navigate(`/organizations/${organizations[0].id}/proposals/create`);
    } else {
      // Otherwise show the organization selector dialog
      setShowOrgSelector(true);
    }
  };
  
  const handleSelectOrg = (orgId: string) => {
    setShowOrgSelector(false);
    navigate(`/organizations/${orgId}/proposals/create`);
  };
  
  // For empty state messaging
  const hasProposals = proposals.length > 0;
  const hasFilteredProposals = sortedProposals.length > 0;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Proposals</h1>
            <p className="text-muted-foreground">
              Browse and vote on governance proposals
            </p>
          </div>
          
          {user && user.isConnected && (
            <Button 
              onClick={handleCreateProposal}
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select
            value={orgFilter}
            onValueChange={setOrgFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <Loading message="Loading proposals..." />
        ) : !hasProposals ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <MessageSquarePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No Proposals Yet</h3>
            <p className="text-muted-foreground mb-4">
              No proposals have been created in any organization yet
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
            >
              <Link to="/organizations">
                Browse Organizations
              </Link>
            </Button>
          </div>
        ) : !hasFilteredProposals ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setOrgFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal} 
                showOrganization 
              />
            ))}
          </div>
        )}
      </div>

      {/* Organization selection dialog */}
      <Dialog open={showOrgSelector} onOpenChange={setShowOrgSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select an organization</DialogTitle>
            <DialogDescription>
              Choose the organization where you want to create a new proposal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {organizations.map(org => (
              <Button 
                key={org.id} 
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelectOrg(org.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">{org.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{org.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProposalsPage;

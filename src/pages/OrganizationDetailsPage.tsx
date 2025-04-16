
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { formatDate } from "@/lib/utils";
import { Building, CheckCircle, Globe, Link as LinkIcon, MessageSquarePlus, PlusCircle, Users } from "lucide-react";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Loading } from "@/components/ui/loading";

const OrganizationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrganization, getOrganizationProposals, isLoading } = useData();
  
  const organization = id ? getOrganization(id) : undefined;
  const proposals = id ? getOrganizationProposals(id) : [];
  
  // Filter proposals by status
  const activeProposals = proposals.filter((p) => p.status === "active");
  const passedProposals = proposals.filter((p) => p.status === "passed");
  const pendingProposals = proposals.filter((p) => p.status === "pending");
  
  if (isLoading) {
    return (
      <AppLayout>
        <Loading message="Loading organization details..." />
      </AppLayout>
    );
  }
  
  if (!organization) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The organization you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/organizations">Back to Organizations</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Organization header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {organization.chain}
              </Badge>
              {organization.tokenName && (
                <Badge variant="secondary">Token: {organization.tokenName}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              {organization.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created {formatDate(organization.createdAt)}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
            >
              <Link to="/organizations">
                Back to All
              </Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
              asChild
            >
              <Link to={`/organizations/${id}/proposals/create`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Proposal
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Organization details and proposals */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left sidebar with organization info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{organization.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{organization.members.length} members</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                    <span>{proposals.length} total proposals</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{organization.chain} Network</span>
                  </div>
                  
                  {organization.tokenAddress && (
                    <div className="flex items-start gap-2 text-sm">
                      <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex flex-col">
                        <span>Token: {organization.tokenName}</span>
                        <span className="text-xs text-muted-foreground break-all">
                          {organization.tokenAddress.substring(0, 10)}...
                          {organization.tokenAddress.substring(organization.tokenAddress.length - 8)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <AIAssistant 
              context={`This conversation is about the organization ${organization.name} which is a DAO on the ${organization.chain} blockchain. The organization description is: ${organization.description}`}
              placeholder="Ask about this organization..."
            />
          </div>
          
          {/* Right area with proposals */}
          <div className="md:col-span-2">
            <Tabs defaultValue="active">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="active" className="relative">
                  Active
                  {activeProposals.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="passed">Passed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              {/* Active proposals tab */}
              <TabsContent value="active">
                {activeProposals.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Active Proposals</CardTitle>
                      <CardDescription>
                        There are currently no active proposals in this organization.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <Button
                        asChild
                        className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
                      >
                        <Link to={`/organizations/${id}/proposals/create`}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create New Proposal
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {activeProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Pending proposals tab */}
              <TabsContent value="pending">
                {pendingProposals.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Pending Proposals</CardTitle>
                      <CardDescription>
                        There are currently no pending proposals in this organization.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <Button
                        asChild
                        className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
                      >
                        <Link to={`/organizations/${id}/proposals/create`}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create New Proposal
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {pendingProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Passed proposals tab */}
              <TabsContent value="passed">
                {passedProposals.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Passed Proposals</CardTitle>
                      <CardDescription>
                        No proposals have been passed in this organization yet.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {passedProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* All proposals tab */}
              <TabsContent value="all">
                {proposals.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Proposals</CardTitle>
                      <CardDescription>
                        No proposals have been created in this organization yet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <Button
                        asChild
                        className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
                      >
                        <Link to={`/organizations/${id}/proposals/create`}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create First Proposal
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {proposals.map((proposal) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrganizationDetailsPage;

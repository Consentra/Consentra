import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VotingInterface } from "@/components/proposals/VotingInterface";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, isVotingActive, timeRemaining } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock, Edit, Pencil, AlertCircle, Bot } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function ProposalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposal, getOrganization, canEditProposal, updateProposal, isLoading } = useData();
  
  const [proposal, setProposal] = useState(getProposal(id || ""));
  const [organization, setOrganization] = useState(proposal ? getOrganization(proposal.organizationId) : undefined);
  
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  useEffect(() => {
    if (proposal && editing) {
      setEditTitle(proposal.title);
      setEditDescription(proposal.description);
    }
  }, [proposal, editing]);
  
  useEffect(() => {
    if (id) {
      const currentProposal = getProposal(id);
      setProposal(currentProposal);
      
      if (currentProposal) {
        setOrganization(getOrganization(currentProposal.organizationId));
      }
    }
  }, [id, getProposal, getOrganization]);
  
  useEffect(() => {
    if (proposal && isVotingActive(proposal)) {
      const timeLeft = new Date(proposal.endDate).getTime() - new Date().getTime();
      const hoursLeft = timeLeft / (1000 * 60 * 60);
      
      if (hoursLeft < 24) {
        toast.warning(`Proposal "${proposal.title}" is ending in ${timeRemaining(proposal.endDate)}`, {
          duration: 6000,
          action: {
            label: "View",
            onClick: () => {
            },
          },
        });
      }
    }
  }, [proposal]);

  if (!proposal || !organization) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Proposal not found</h2>
          <p className="text-muted-foreground mt-2">The proposal you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/proposals")} className="mt-4">
            Back to Proposals
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const isAdmin = organization.creator === proposal.creator;
  const userCanEdit = canEditProposal(proposal.id);
  
  const handleSaveEdit = async () => {
    try {
      if (!editTitle.trim() || !editDescription.trim()) {
        toast.error("Title and description cannot be empty");
        return;
      }
      
      await updateProposal(proposal.id, {
        title: editTitle,
        description: editDescription
      });
      
      setProposal(getProposal(proposal.id));
      setEditing(false);
      toast.success("Proposal updated successfully");
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast.error("Failed to update proposal");
    }
  };
  
  return (
    <AppLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {isVotingActive(proposal) && new Date(proposal.endDate).getTime() - new Date().getTime() < (24 * 60 * 60 * 1000) && (
            <Alert variant="default" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600">Deadline approaching</AlertTitle>
              <AlertDescription className="text-amber-600">
                This proposal ends in {timeRemaining(proposal.endDate)}. Cast your vote before the deadline.
              </AlertDescription>
            </Alert>
          )}

          {proposal.agentVote && (
            <Alert variant="default" className="border-blue-400 bg-blue-50 dark:bg-blue-950/30">
              <Bot className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-600">AI Agent recommendation</AlertTitle>
              <AlertDescription className="text-blue-600">
                Your AI agent recommends voting: <strong>{proposal.agentVote}</strong>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                        Why?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Based on your preferences and past voting patterns, the AI agent suggests this vote. You can always override this recommendation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-start">
            <div>
              {organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={organization.logoUrl || ""} alt={organization.name} />
                    <AvatarFallback className="text-xs">{organization.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{organization.name}</span>
                  {isAdmin && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">Admin</Badge>
                  )}
                </div>
              )}
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {proposal.status}
              </Badge>
              {userCanEdit && !editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>
                {isVotingActive(proposal) 
                  ? `${timeRemaining(proposal.endDate)}`
                  : `Ended ${formatDate(proposal.endDate)}`
                }
              </span>
            </div>
            <div>
              Created {formatDate(proposal.createdAt)}
            </div>
            {proposal.lastEditedAt && (
              <div>
                Edited {formatDate(proposal.lastEditedAt)}
              </div>
            )}
          </div>
          
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="votes">Votes ({proposal.votes.length})</TabsTrigger>
              {proposal.summary && <TabsTrigger value="summary">AI Summary</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {editing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Proposal</CardTitle>
                    <CardDescription>
                      Update your proposal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={8}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-2 p-6 pt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{proposal.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="votes">
              <Card>
                <CardContent className="pt-6">
                  {proposal.votes.length > 0 ? (
                    <div className="space-y-4">
                      {proposal.votes.map((vote, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                          <div>
                            <div className="font-medium">
                              {vote.voter.substring(0, 6)}...{vote.voter.substring(vote.voter.length - 4)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Voted: {typeof vote.choice === 'number' 
                                ? proposal.options[vote.choice]
                                : vote.choice.map(c => proposal.options[c]).join(', ')
                              }
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(vote.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No votes have been cast yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {proposal.summary && (
              <TabsContent value="summary">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/lovable-uploads/ccc56536-c5dd-40e7-a74d-1a15086f93f2.png" alt="Daisy AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <p className="font-medium">Daisy AI Summary</p>
                        <p className="text-muted-foreground">{proposal.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <VotingInterface 
            proposal={proposal} 
            onVoteSubmitted={() => setProposal(getProposal(proposal.id))} 
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <AIAssistant 
                    placeholder="Ask about this proposal..." 
                    context={`You are discussing the proposal "${proposal.title}" which has the description: "${proposal.description}". The proposal belongs to the organization "${organization.name}" and has ${proposal.votes.length} votes.`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>The AI assistant can help you understand this proposal, analyze its potential impact, and answer any questions you might have.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </AppLayout>
  );
}

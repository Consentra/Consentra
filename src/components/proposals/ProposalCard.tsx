
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/types";
import { CalendarClock, MessageSquareText, TrendingUp, Vote } from "lucide-react";
import { formatDate, timeRemaining, calculateResults } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProposalCardProps {
  proposal: Proposal;
  showOrganization?: boolean;
}

export function ProposalCard({ proposal, showOrganization = false }: ProposalCardProps) {
  const { id, title, description, status, startDate, endDate, votes, summary, organizationId, creator } = proposal;
  const { getOrganization, userData } = useData();
  
  const organization = getOrganization(organizationId);
  const isAdmin = organization?.creator === creator;
  
  const getBadgeColor = () => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'passed': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      default: return '';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'passed': return 'Passed';
      case 'failed': return 'Failed';
      case 'pending': return 'Pending';
      default: return status;
    }
  };
  
  const results = calculateResults(proposal);
  const totalVotes = votes.length;
  
  // Show a preview of the voting results if there are votes
  const topResult = results.length > 0 
    ? results.reduce((prev, current) => (prev.votes > current.votes) ? prev : current)
    : null;
    
  const topResultPercentage = topResult && totalVotes > 0 
    ? Math.round((topResult.votes / totalVotes) * 100) 
    : 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            {organization && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={organization.logoUrl || ""} alt={organization.name} />
                  <AvatarFallback className="text-xs">{organization.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{organization.name}</span>
                {isAdmin && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">Admin</Badge>
                )}
              </div>
            )}
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            <CardDescription>
              {summary || description.substring(0, 100)}
              {!summary && description.length > 100 ? '...' : ''}
            </CardDescription>
          </div>
          <Badge className={getBadgeColor()} variant="outline">
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>{status === 'active' ? timeRemaining(endDate) : formatDate(endDate)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Vote className="h-4 w-4 text-muted-foreground" />
            <span>{votes.length} vote{votes.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {totalVotes > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Leading: {topResult?.option}</span>
              <span className="font-medium">{topResultPercentage}%</span>
            </div>
            <Progress value={topResultPercentage} className="h-2" />
          </div>
        )}
        
        {proposal.aiPrediction && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>
              {Math.round(proposal.aiPrediction.likelihood * 100)}% likelihood to pass
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full">
          <Link to={`/proposals/${id}`}>View Proposal</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

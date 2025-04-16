
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Proposal } from '@/types';
import { useData } from '@/contexts/DataContext';
import { ArrowRight, Bot, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useAI } from '@/contexts/AIContext';

interface VotingInterfaceProps {
  proposal: Proposal;
  onVoteSubmitted?: () => void;
}

export function VotingInterface({ proposal, onVoteSubmitted }: VotingInterfaceProps) {
  const { castVote, isLoading } = useData();
  const { user } = useWallet();
  const { getRecommendation, isLoading: isAILoading, agentSettings, autoVoteOnProposal } = useAI();
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [autoVoteChecked, setAutoVoteChecked] = useState(false);
  
  const userHasVoted = proposal.votes.some(v => user && v.voter === user.address);
  const isActive = proposal.status === 'active';
  
  // Try auto voting when component mounts if agent is enabled and auto-vote is on
  useEffect(() => {
    const tryAutoVote = async () => {
      if (agentSettings.enabled && 
          agentSettings.autoVote && 
          isActive && 
          !userHasVoted && 
          user) {
        const voted = await autoVoteOnProposal(proposal);
        if (voted && onVoteSubmitted) {
          onVoteSubmitted();
        }
      }
    };
    
    tryAutoVote();
  }, [agentSettings, proposal, userHasVoted, isActive, user, autoVoteOnProposal, onVoteSubmitted]);
  
  // Calculate results for display
  const results = proposal.options.map((option, index) => {
    const optionVotes = proposal.votes.filter(vote => {
      if (typeof vote.choice === 'number') {
        return vote.choice === index;
      }
      return Array.isArray(vote.choice) && vote.choice.includes(index);
    });
    
    const voteCount = optionVotes.reduce((sum, vote) => sum + (vote.weight || 1), 0);
    const totalVotes = proposal.votes.reduce((sum, vote) => sum + (vote.weight || 1), 0);
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    
    return {
      option,
      votes: voteCount,
      percentage,
    };
  });
  
  const handleSingleChoiceChange = (value: string) => {
    setSelectedOptions([parseInt(value)]);
  };
  
  const handleMultipleChoiceChange = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, index]);
    } else {
      setSelectedOptions(prev => prev.filter(i => i !== index));
    }
  };
  
  const handleSubmitVote = async () => {
    if (!user) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    
    try {
      if (proposal.voteType === 'single-choice' && selectedOptions.length > 0) {
        await castVote(proposal.id, selectedOptions[0]);
      } else {
        await castVote(proposal.id, selectedOptions);
      }
      
      toast.success('Vote submitted successfully!');
      if (onVoteSubmitted) {
        onVoteSubmitted();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
    }
  };
  
  const getRecommendationFromAI = async () => {
    try {
      const response = await getRecommendation(proposal);
      setRecommendation(response.recommendation);
      setShowRecommendation(true);
      
      // If auto-vote is enabled, select the recommended option
      if (response.choice !== null && agentSettings.autoVote) {
        setSelectedOptions([response.choice]);
      }
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      toast.error('Failed to get AI recommendation. Please try again.');
    }
  };
  
  // Render voting options for results view
  const renderResults = () => (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{result.option}</span>
            <span>
              {result.votes} vote{result.votes !== 1 ? 's' : ''} ({Math.round(result.percentage)}%)
            </span>
          </div>
          <Progress value={result.percentage} className="h-2" />
        </div>
      ))}
      
      <div className="text-sm text-muted-foreground pt-2">
        Total: {proposal.votes.length} vote{proposal.votes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
  
  // Render single choice voting
  const renderSingleChoice = () => (
    <RadioGroup 
      onValueChange={handleSingleChoiceChange} 
      className="space-y-2"
      value={selectedOptions[0]?.toString()}
    >
      {proposal.options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 border rounded-md p-3">
          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
          <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
  
  // Render multiple choice voting
  const renderMultipleChoice = () => (
    <div className="space-y-2">
      {proposal.options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 border rounded-md p-3">
          <Checkbox
            id={`option-${index}`}
            checked={selectedOptions.includes(index)}
            onCheckedChange={(checked) => handleMultipleChoiceChange(index, checked === true)}
          />
          <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          {isActive 
            ? userHasVoted 
              ? "You've already voted on this proposal" 
              : "Select your preferred option and submit your vote"
            : "Voting is closed for this proposal"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userHasVoted || !isActive ? (
          renderResults()
        ) : (
          <>
            {proposal.voteType === 'single-choice' ? renderSingleChoice() : renderMultipleChoice()}
            
            {showRecommendation && recommendation && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-medium">Daisy Recommendation</span>
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
      {isActive && !userHasVoted && (
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:mr-auto flex items-center gap-2"
            onClick={getRecommendationFromAI}
            disabled={isAILoading || !agentSettings.enabled}
          >
            {isAILoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            Get AI Recommendation
          </Button>
          <Button 
            onClick={handleSubmitVote} 
            disabled={isLoading || selectedOptions.length === 0}
            className="flex items-center gap-2"
          >
            Submit Vote
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

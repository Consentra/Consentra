
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Proposal } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeRemaining(endTimestamp: number): string {
  const now = Date.now();
  const timeLeft = endTimestamp - now;
  
  if (timeLeft <= 0) {
    return "Ended";
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
  } else {
    return "Ending soon";
  }
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function calculateResults(proposal: Proposal) {
  // Create results array with all options
  const results = proposal.options.map((option, index) => ({
    option,
    index,
    votes: 0,
    percentage: 0
  }));
  
  let totalVotes = 0;
  
  // Count votes for each option
  proposal.votes.forEach(vote => {
    const weight = vote.weight || 1;
    totalVotes += weight;
    
    if (typeof vote.choice === 'number') {
      // Single choice vote
      results[vote.choice].votes += weight;
    } else if (Array.isArray(vote.choice)) {
      // Multiple choice vote - split weight equally among chosen options
      const splitWeight = weight / vote.choice.length;
      vote.choice.forEach(choiceIndex => {
        results[choiceIndex].votes += splitWeight;
      });
    }
  });
  
  // Calculate percentages
  if (totalVotes > 0) {
    results.forEach(result => {
      result.percentage = (result.votes / totalVotes) * 100;
    });
  }
  
  return results;
}

// Check if voting has ended
export function isVotingEnded(proposal: Proposal): boolean {
  return Date.now() > proposal.endDate;
}

// Check if voting has started
export function isVotingStarted(proposal: Proposal): boolean {
  return Date.now() >= proposal.startDate;
}

// Check if voting is active
export function isVotingActive(proposal: Proposal): boolean {
  return isVotingStarted(proposal) && !isVotingEnded(proposal);
}

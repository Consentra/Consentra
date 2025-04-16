
// Common types used throughout the application

export interface User {
  address: string;
  isConnected: boolean;
}

export type Chain = 'hedera' | 'soneium' | 'ethereum' | 'rootstock';

export interface Organization {
  id: string;
  name: string;
  description: string;
  creator: string;
  chain: Chain;
  tokenAddress?: string;
  tokenName?: string;
  website: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  logoUrl?: string;
  members: string[];
  proposals: string[];
  createdAt: number;
}

export type VoteType = 'single-choice' | 'multiple-choice' | 'token-weighted';

export type VoteStatus = 'active' | 'passed' | 'failed' | 'pending';

export interface Proposal {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  creator: string;
  voteType: VoteType;
  options: string[];
  startDate: number;
  endDate: number;
  status: VoteStatus;
  votes: Vote[];
  summary?: string;
  agentVote?: string;
  aiPrediction?: {
    likelihood: number;
    rationale: string;
  };
  createdAt: number;
  lastEditedAt?: number;
  chain?: Chain;
  tokenDetails?: {
    name: string;
    address: string;
  };
  hybridVoting?: {
    nftAddress: string;
    tokenAddress?: string;
  };
}

export interface Vote {
  voter: string;
  choice: number | number[];
  weight?: number;
  timestamp: number;
  isAutoVote?: boolean;
}

export interface UserPreference {
  id: string;
  userId: string;
  categories: string[];
  keywords: string[];
  autoVoteEnabled: boolean;
  preferredOutcomes: Record<string, number | number[]>;
}

export interface AgentSettings {
  enabled: boolean;
  autoVote: boolean;
  autoSummarize: boolean;
  notifyOnProposal: boolean;
}

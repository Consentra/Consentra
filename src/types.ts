
export interface User {
  address: string;
  isConnected: boolean;
}

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
  status: ProposalStatus;
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

export type Chain = 'ethereum' | 'hedera' | 'soneium' | 'rootstock';
export type VoteType = 'single-choice' | 'multiple-choice' | 'token-weighted';
export type ProposalStatus = 'active' | 'passed' | 'failed' | 'pending';

export interface Vote {
  voter: string;
  choice: number | number[];
  weight?: number;
  timestamp: number;
}

export interface UserPreference {
  id: string;
  userId: string;
  categories: string[];
  keywords: string[];
  autoVoteEnabled: boolean;
  preferredOutcomes: {
    [categoryOrOrgId: string]: number;
  };
}

export interface AgentSettings {
  enabled: boolean;
  autoVote: boolean;
  autoSummarize: boolean;
  notifyOnProposal: boolean;
}

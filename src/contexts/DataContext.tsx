import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Organization, Proposal, User, UserPreference, Chain } from '@/types';

// Define the shape of our context
interface DataContextType {
  organizations: Organization[];
  proposals: Proposal[];
  userData: Record<string, any> | null;
  userPreferences: Partial<UserPreference> | null;
  isLoading: boolean;
  error: string | null;
  
  // Organization methods
  getOrganization: (id: string) => Organization | undefined;
  createOrganization: (orgData: Omit<Organization, "id" | "members" | "proposals" | "createdAt">) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<Organization>;
  getOrganizationProposals: (organizationId: string) => Proposal[];
  
  // Proposal methods
  getProposal: (id: string) => Proposal | undefined;
  createProposal: (proposalData: Omit<Proposal, "id" | "createdAt" | "votes" | "status">) => Promise<Proposal>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<Proposal>;
  castVote: (proposalId: string, choice: number | number[], weight?: number) => Promise<void>;
  canEditProposal: (proposalId: string) => boolean;
  
  // User data methods
  updateUserData: (data: Record<string, any>) => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreference>) => Promise<void>;
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  organizations: [],
  proposals: [],
  userData: null,
  userPreferences: null,
  isLoading: false,
  error: null,
  
  getOrganization: () => undefined,
  createOrganization: async () => ({ 
    id: '', 
    name: '', 
    description: '', 
    creator: '', 
    chain: 'ethereum', 
    website: '', 
    members: [], 
    proposals: [], 
    createdAt: 0 
  }),
  updateOrganization: async () => ({ 
    id: '', 
    name: '', 
    description: '', 
    creator: '', 
    chain: 'ethereum', 
    website: '', 
    members: [], 
    proposals: [], 
    createdAt: 0 
  }),
  getOrganizationProposals: () => [],
  
  getProposal: () => undefined,
  createProposal: async () => ({ 
    id: '', 
    organizationId: '', 
    title: '', 
    description: '', 
    creator: '', 
    voteType: 'single-choice', 
    options: [], 
    startDate: 0, 
    endDate: 0, 
    status: 'pending', 
    votes: [], 
    createdAt: 0 
  }),
  updateProposal: async () => ({ 
    id: '', 
    organizationId: '', 
    title: '', 
    description: '', 
    creator: '', 
    voteType: 'single-choice', 
    options: [], 
    startDate: 0, 
    endDate: 0, 
    status: 'pending', 
    votes: [], 
    createdAt: 0 
  }),
  castVote: async () => {},
  canEditProposal: () => false,
  
  updateUserData: async () => {},
  updateUserPreferences: async () => {},
});

// Default organizations data
const defaultOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "DeFi Protocol",
    description: "Decentralized finance protocol for lending and borrowing",
    creator: "0x1234567890123456789012345678901234567890",
    chain: "ethereum",
    tokenAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    tokenName: "DFI",
    website: "https://defi-protocol.io",
    socialLinks: {
      twitter: "defiprotocol",
      github: "defi-protocol"
    },
    logoUrl: "/lovable-uploads/ccc56536-c5dd-40e7-a74d-1a15086f93f2.png",
    members: ["0x1234567890123456789012345678901234567890"],
    proposals: ["prop-1", "prop-2"],
    createdAt: Date.now() - 1000000
  },
  {
    id: "org-2",
    name: "NFT Collective",
    description: "Artist collective for NFT creation and curation",
    creator: "0x2345678901234567890123456789012345678901",
    chain: "hedera",
    website: "https://nft-collective.art",
    logoUrl: "/lovable-uploads/ccc56536-c5dd-40e7-a74d-1a15086f93f2.png",
    members: ["0x1234567890123456789012345678901234567890", "0x2345678901234567890123456789012345678901"],
    proposals: ["prop-3"],
    createdAt: Date.now() - 500000
  }
];

// Default proposals data
const defaultProposals: Proposal[] = [
  {
    id: "prop-1",
    organizationId: "org-1",
    title: "Implement DeFi Staking Protocol",
    description: "Proposal to implement a staking protocol to allow users to earn rewards on their cryptocurrency holdings.",
    creator: "0x1234567890123456789012345678901234567890",
    voteType: "single-choice",
    options: ["Approve", "Reject", "Abstain"],
    startDate: Date.now() - 300000,
    endDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    status: "active",
    votes: [
      {
        voter: "0x2345678901234567890123456789012345678901",
        choice: 0, // Approve
        timestamp: Date.now() - 100000
      }
    ],
    summary: "This proposal aims to introduce a staking protocol that will enable platform users to earn rewards by staking their tokens. The staking mechanism will use a PoS consensus algorithm with a tiered reward structure.",
    createdAt: Date.now() - 300000,
    chain: "ethereum",
    tokenDetails: {
      name: "DeFi Token",
      address: "0xabcdef1234567890abcdef1234567890abcdef12"
    }
  },
  {
    id: "prop-2",
    organizationId: "org-1",
    title: "Treasury Allocation for Q2",
    description: "Proposal to allocate treasury funds for development, marketing, and community initiatives in Q2 2023.",
    creator: "0x1234567890123456789012345678901234567890",
    voteType: "token-weighted",
    options: ["Approve Plan A", "Approve Plan B", "Reject Both Plans"],
    startDate: Date.now() - 500000,
    endDate: Date.now() - 100000,
    status: "passed",
    votes: [
      {
        voter: "0x1234567890123456789012345678901234567890",
        choice: 0,
        weight: 1000,
        timestamp: Date.now() - 300000
      },
      {
        voter: "0x2345678901234567890123456789012345678901",
        choice: 0,
        weight: 500,
        timestamp: Date.now() - 200000
      }
    ],
    createdAt: Date.now() - 500000,
    lastEditedAt: Date.now() - 400000,
    chain: "ethereum",
    tokenDetails: {
      name: "DeFi Token",
      address: "0xabcdef1234567890abcdef1234567890abcdef12"
    }
  },
  {
    id: "prop-3",
    organizationId: "org-2",
    title: "Launch NFT Marketplace",
    description: "Proposal to launch an NFT marketplace for the collective with a focus on sustainable and eco-friendly minting.",
    creator: "0x2345678901234567890123456789012345678901",
    voteType: "multiple-choice",
    options: ["Launch in Q2", "Launch in Q3", "Partner with existing marketplace", "Delay until 2024"],
    startDate: Date.now() - 200000,
    endDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
    status: "active",
    votes: [],
    createdAt: Date.now() - 200000,
    chain: "hedera",
    hybridVoting: {
      nftAddress: "0x3456789012345678901234567890123456789012"
    }
  }
];

// Provider component that wraps the app and provides context value
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(defaultOrganizations);
  const [proposals, setProposals] = useState<Proposal[]>(defaultProposals);
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [userPreferences, setUserPreferences] = useState<Partial<UserPreference> | null>({
    categories: [],
    keywords: [],
    autoVoteEnabled: false,
    preferredOutcomes: {}
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Organization methods
  const getOrganization = (id: string) => {
    return organizations.find(org => org.id === id);
  };

  const createOrganization = async (orgData: Omit<Organization, "id" | "members" | "proposals" | "createdAt">) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      const newOrg: Organization = {
        ...orgData,
        id: `org-${Date.now()}`,
        members: [orgData.creator],
        proposals: [],
        createdAt: Date.now()
      };
      
      // Update state
      setOrganizations(prev => [...prev, newOrg]);
      setIsLoading(false);
      return newOrg;
    } catch (err) {
      setError("Failed to create organization");
      setIsLoading(false);
      throw err;
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the org to update
      const orgIndex = organizations.findIndex(org => org.id === id);
      
      if (orgIndex === -1) {
        throw new Error("Organization not found");
      }
      
      // Create updated org
      const updatedOrg = {
        ...organizations[orgIndex],
        ...updates
      };
      
      // Update state
      const newOrgs = [...organizations];
      newOrgs[orgIndex] = updatedOrg;
      setOrganizations(newOrgs);
      setIsLoading(false);
      return updatedOrg;
    } catch (err) {
      setError("Failed to update organization");
      setIsLoading(false);
      throw err;
    }
  };

  // Proposal methods
  const getProposal = (id: string) => {
    return proposals.find(proposal => proposal.id === id);
  };

  const createProposal = async (proposalData: Omit<Proposal, "id" | "createdAt" | "votes" | "status">) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      const newProposal: Proposal = {
        ...proposalData,
        id: `prop-${Date.now()}`,
        createdAt: Date.now(),
        status: new Date() >= new Date(proposalData.startDate) ? "active" : "pending",
        votes: [],
        chain: proposalData.chain,
        tokenDetails: proposalData.tokenDetails,
        hybridVoting: proposalData.hybridVoting
      };
      
      // Update proposals state
      setProposals(prev => [...prev, newProposal]);
      
      // Also update the organization's proposals array
      const orgIndex = organizations.findIndex(org => org.id === proposalData.organizationId);
      if (orgIndex !== -1) {
        const updatedOrg = {
          ...organizations[orgIndex],
          proposals: [...organizations[orgIndex].proposals, newProposal.id]
        };
        
        const newOrgs = [...organizations];
        newOrgs[orgIndex] = updatedOrg;
        setOrganizations(newOrgs);
      }
      
      setIsLoading(false);
      return newProposal;
    } catch (err) {
      setError("Failed to create proposal");
      setIsLoading(false);
      throw err;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the proposal to update
      const proposalIndex = proposals.findIndex(proposal => proposal.id === id);
      
      if (proposalIndex === -1) {
        throw new Error("Proposal not found");
      }
      
      // Create updated proposal
      const updatedProposal = {
        ...proposals[proposalIndex],
        ...updates,
        lastEditedAt: Date.now()
      };
      
      // Update state
      const newProposals = [...proposals];
      newProposals[proposalIndex] = updatedProposal;
      setProposals(newProposals);
      setIsLoading(false);
      return updatedProposal;
    } catch (err) {
      setError("Failed to update proposal");
      setIsLoading(false);
      throw err;
    }
  };

  const castVote = async (proposalId: string, choice: number | number[], weight?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the proposal
      const proposalIndex = proposals.findIndex(proposal => proposal.id === proposalId);
      
      if (proposalIndex === -1) {
        throw new Error("Proposal not found");
      }
      
      // Create a new vote
      const newVote = {
        voter: "0x1234567890123456789012345678901234567890", // In a real app, this would be the connected user's address
        choice,
        weight: weight || 1,
        timestamp: Date.now()
      };
      
      // Add vote to proposal
      const updatedProposal = {
        ...proposals[proposalIndex],
        votes: [...proposals[proposalIndex].votes, newVote]
      };
      
      // Update state
      const newProposals = [...proposals];
      newProposals[proposalIndex] = updatedProposal;
      setProposals(newProposals);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to cast vote");
      setIsLoading(false);
      throw err;
    }
  };

  const canEditProposal = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      return false;
    }
    
    // In a real app, we would check if the current user is the creator
    // For now, just return true for demo purposes
    return true;
  };

  // User data methods
  const updateUserData = async (data: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      setUserData(prev => ({
        ...prev,
        ...data
      }));
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update user data");
      setIsLoading(false);
      throw err;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<UserPreference>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setUserPreferences(prev => ({
        ...prev,
        ...preferences
      }));
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update user preferences");
      setIsLoading(false);
      throw err;
    }
  };

  const getOrganizationProposals = (organizationId: string) => {
    return proposals.filter(proposal => proposal.organizationId === organizationId);
  };

  const value = {
    organizations,
    proposals,
    userData,
    userPreferences,
    isLoading,
    error,
    
    getOrganization,
    createOrganization,
    updateOrganization,
    getOrganizationProposals,
    
    getProposal,
    createProposal,
    updateProposal,
    castVote,
    canEditProposal,
    
    updateUserData,
    updateUserPreferences
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

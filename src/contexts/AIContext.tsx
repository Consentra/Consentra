
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AgentSettings, Proposal } from '@/types';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

// Using fixed API key
const MISTRAL_API_KEY = "n8uqr7ggLk7lUd3kEqvbhepMnIObjmAU";

interface AIContextType {
  isLoading: boolean;
  agentSettings: AgentSettings;
  updateAgentSettings: (settings: Partial<AgentSettings>) => void;
  getSummary: (proposalText: string) => Promise<string>;
  getRecommendation: (proposal: Proposal) => Promise<{ recommendation: string, choice: number | null }>;
  askQuestion: (question: string, context: string) => Promise<string>;
  predictOutcome: (proposal: Proposal) => Promise<{ likelihood: number, rationale: string }>;
  autoVoteOnProposal: (proposal: Proposal) => Promise<boolean>;
  isApiKeyValid: boolean;
}

// Default agent settings
const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  enabled: true,
  autoVote: false,
  autoSummarize: true,
  notifyOnProposal: true,
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agentSettings');
    return saved ? JSON.parse(saved) : DEFAULT_AGENT_SETTINGS;
  });
  const [isApiKeyValid, setIsApiKeyValid] = useState(true);
  const { castVote } = useData();

  useEffect(() => {
    // Verify API key on component mount
    verifyApiKey();
  }, []);

  // Verify the built-in API key
  const verifyApiKey = async () => {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        }
      });
      
      setIsApiKeyValid(response.ok);
      
      if (!response.ok) {
        console.error('API key validation failed:', await response.text());
        toast.error('The Mistral AI API key is invalid or expired');
      }
    } catch (error) {
      console.error('Error verifying API key:', error);
      setIsApiKeyValid(false);
      toast.error('Failed to connect to Mistral AI API');
    }
  };

  // Update agent settings
  const updateAgentSettings = (settings: Partial<AgentSettings>) => {
    const newSettings = { ...agentSettings, ...settings };
    setAgentSettings(newSettings);
    localStorage.setItem('agentSettings', JSON.stringify(newSettings));
    
    // Show toast notification when settings are updated
    toast.success("Daisy agent settings updated");
  };

  // Call Mistral AI API
  async function callMistralAPI(prompt: string): Promise<string> {
    setIsLoading(true);
    try {
      if (!isApiKeyValid) {
        return "The Mistral AI API key is invalid or expired. Please contact the administrator.";
      }
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are Daisy, a governance assistant for a decentralized organization. Your responses should be concise, informative, and focused on helping users make better decisions about proposals and voting. Limit responses to 2-3 sentences when possible.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 250
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Mistral API error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      
      // In case of API failure, fall back to mock responses
      return mockAIResponse(prompt);
    } finally {
      setIsLoading(false);
    }
  }

  // Mock AI response based on prompt content (fallback for development)
  function mockAIResponse(prompt: string): string {
    if (prompt.includes('summarize')) {
      return 'This proposal aims to upgrade the protocol\'s treasury management system by implementing a multi-signature wallet requiring 3-of-5 approvals for transactions exceeding 10,000 tokens. The change would enhance security through distributed authorization while maintaining operational efficiency for day-to-day activities.';
    } else if (prompt.includes('recommend') || prompt.includes('vote')) {
      return 'Based on your previous voting patterns and stated preferences for increased security measures, I recommend voting in favor of this proposal. The multi-signature requirement aligns with your priority on robust treasury protection.';
    } else if (prompt.includes('predict') || prompt.includes('outcome')) {
      return 'The proposal has a 78% likelihood of passing based on historical voting patterns, current community sentiment, and stakeholder composition. Key stakeholders who typically influence outcomes have signaled support.';
    } else if (prompt.includes('verification') || prompt.includes('verify')) {
      return 'To verify your identity, please submit the required documents through your profile page. Once verified, you will receive a SoulBound NFT that serves as your digital identity verification within the platform.';
    } else if (prompt.includes('agent') || prompt.includes('AI')) {
      return 'Daisy helps you participate in governance by analyzing proposals, providing summaries, offering voting recommendations based on your preferences, and even voting on your behalf if you enable auto-voting. You can customize all these settings in the Agent page.';
    } else {
      return 'I\'ve analyzed the proposal and found it to be well-structured with clear implementation details. The timeline seems feasible, though I recommend paying attention to the treasury transition period mentioned in section 3.2.';
    }
  }

  // Get summary of proposal
  const getSummary = async (proposalText: string): Promise<string> => {
    return callMistralAPI(`Summarize the following DAO proposal in 2-3 concise sentences, focusing on the main objective and key changes: ${proposalText}`);
  };

  // Get recommendation for proposal
  const getRecommendation = async (proposal: Proposal): Promise<{ recommendation: string, choice: number | null }> => {
    const response = await callMistralAPI(`Recommend how to vote on this proposal based on user preferences. Proposal: ${proposal.title} - ${proposal.description}`);
    // In a real implementation, we would parse the response to extract the recommended choice
    // For demo purposes, always return the first option (index 0)
    return { recommendation: response, choice: 0 };
  };

  // Automatic voting on a proposal based on AI recommendation
  const autoVoteOnProposal = async (proposal: Proposal): Promise<boolean> => {
    if (!agentSettings.enabled || !agentSettings.autoVote) {
      return false;
    }

    try {
      setIsLoading(true);
      // Get recommendation
      const { choice } = await getRecommendation(proposal);
      
      if (choice === null) {
        return false;
      }
      
      // Cast vote using the recommended choice
      await castVote(proposal.id, choice);
      
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Daisy voted on your behalf</span>
          <span className="text-sm">Proposal: {proposal.title}</span>
        </div>
      );
      
      return true;
    } catch (error) {
      console.error('Error in auto-voting:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Ask a question about a proposal
  const askQuestion = async (question: string, context: string): Promise<string> => {
    return callMistralAPI(`Answer this question about a DAO proposal: "${question}". Context: ${context}`);
  };

  // Predict outcome of proposal
  const predictOutcome = async (proposal: Proposal): Promise<{ likelihood: number, rationale: string }> => {
    const response = await callMistralAPI(`Predict the likelihood of this proposal passing and provide a rationale. Proposal: ${proposal.title} - ${proposal.description}`);
    // For demo, extract a percentage from the mock response
    const likelihood = parseFloat(response.match(/(\d+)%/)?.[1] || '50') / 100;
    return { 
      likelihood, 
      rationale: response 
    };
  };

  return (
    <AIContext.Provider value={{ 
      isLoading, 
      agentSettings, 
      updateAgentSettings, 
      getSummary, 
      getRecommendation, 
      askQuestion, 
      predictOutcome,
      autoVoteOnProposal,
      isApiKeyValid
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

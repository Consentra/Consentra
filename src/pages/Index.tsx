
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { AppLayout } from "@/components/layout/AppLayout";

const Index = () => {
  return (
    <AppLayout requireAuth={false}>
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">
              Decentralized Governance Platform
            </h1>
            <p className="text-muted-foreground">
              Empowering communities through transparent and collaborative decision-making.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              asChild 
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
            >
              <Link to="/organizations">
                Browse Organizations
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              className="gap-2"
            >
              <Link to="/proposals">
                <PlusCircle className="h-4 w-4" />
                Browse Proposals
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard 
              title="Voting Systems" 
              description="Multiple voting mechanisms to suit your community's needs."
              tooltip="Choose from token-based (1 token = 1 vote), soulbound NFT-based (1 human = 1 vote), or hybrid voting systems."
            />
            
            <FeatureCard 
              title="AI Governance" 
              description="Intelligent agent assistance for better decision-making."
              tooltip="Our AI agent can analyze proposals, predict outcomes, and even vote based on your preferences. You always maintain the final say with manual override options."
            />
            
            <FeatureCard 
              title="Cross-Chain Compatibility" 
              description="Built for Hedera and Soneium with future chain support."
              tooltip="Our modular design works seamlessly across multiple blockchains, ensuring your governance isn't limited to a single ecosystem."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Feature card with tooltip explanation
const FeatureCard = ({ title, description, tooltip }: { 
  title: string; 
  description: string; 
  tooltip: string;
}) => (
  <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
    <HoverCard>
      <HoverCardTrigger asChild>
        <h3 className="text-lg font-semibold cursor-help border-b border-dotted border-muted-foreground inline-block">{title}</h3>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <p className="text-sm">{tooltip}</p>
      </HoverCardContent>
    </HoverCard>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;

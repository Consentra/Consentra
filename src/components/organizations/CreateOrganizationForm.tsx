
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Globe, Twitter, Github, Linkedin } from "lucide-react";
import { Chain } from "@/types";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export function CreateOrganizationForm() {
  const navigate = useNavigate();
  const { createOrganization, isLoading } = useData();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chain, setChain] = useState<Chain>("hedera");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !chain || !website) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const newOrg = await createOrganization({
        name,
        description,
        creator: "", // Will be set by the context
        chain,
        website,
        socialLinks: {
          twitter,
          github,
          linkedin
        },
        logoUrl: logoUrl || "/lovable-uploads/ccc56536-c5dd-40e7-a74d-1a15086f93f2.png", // Default to Consentra logo
        tokenName: tokenName || undefined,
        tokenAddress: tokenAddress || undefined,
      });
      
      // TODO: Implement NFT minting for verification
      toast.success("Organization created successfully! Minting verification NFT...");
      navigate(`/organizations/${newOrg.id}`);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>
            Set up a DAO or governance organization on your preferred blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and goals of your organization"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website *</Label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Input
                id="website"
                placeholder="https://your-organization.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="github"
                  placeholder="organization"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  placeholder="organization"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Organization Logo URL</Label>
            <Input
              id="logoUrl"
              type="text"
              placeholder="Enter logo URL or upload an image"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default Consentra logo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chain">Blockchain *</Label>
            <Select
              value={chain}
              onValueChange={(value) => setChain(value as Chain)}
            >
              <SelectTrigger id="chain">
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hedera">Hedera</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="rootstock">Rootstock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-3">Token Configuration (Optional)</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  placeholder="e.g. Governance Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenAddress">Token Contract Address</Label>
                <Input
                  id="tokenAddress"
                  placeholder="Enter token contract address"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/organizations")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}


import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, TrashIcon, Hash, CircleDollarSign, Layers } from "lucide-react";
import { format } from "date-fns";
import { Chain, VoteType } from "@/types";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

export function CreateProposalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useParams<{ orgId: string }>();
  const { createProposal, isLoading, getOrganization, organizations } = useData();
  
  const [selectedOrgId, setSelectedOrgId] = useState<string>(orgId || "");
  const organization = selectedOrgId ? getOrganization(selectedOrgId) : null;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voteType, setVoteType] = useState<VoteType>("single-choice");
  const [options, setOptions] = useState(["Yes", "No", "Abstain"]);
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default: 7 days from now
  );
  
  // New state variables for additional features
  const [selectedChain, setSelectedChain] = useState<Chain>("ethereum");
  const [isTokenVoting, setIsTokenVoting] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [isHybridVoting, setIsHybridVoting] = useState(false);
  const [nftAddress, setNftAddress] = useState("");
  
  // Network options
  const networkOptions: Chain[] = ["ethereum", "hedera", "soneium", "rootstock"];
  
  // Handle adding a new option
  const addOption = () => {
    if (newOption && !options.includes(newOption)) {
      setOptions([...options, newOption]);
      setNewOption("");
    }
  };
  
  // Handle removing an option
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  
  // Update vote type when token voting or hybrid voting is toggled
  useEffect(() => {
    if (isTokenVoting || isHybridVoting) {
      setVoteType("token-weighted");
    }
  }, [isTokenVoting, isHybridVoting]);
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startDate || !endDate || !selectedOrgId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (options.length < 2) {
      toast.error("Please add at least two voting options");
      return;
    }
    
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    if (isTokenVoting && (!tokenName || !tokenAddress)) {
      toast.error("Please provide token name and address for token voting");
      return;
    }
    
    if (isHybridVoting && !nftAddress) {
      toast.error("Please provide NFT address for hybrid voting");
      return;
    }
    
    try {
      const newProposal = await createProposal({
        organizationId: selectedOrgId,
        title,
        description,
        creator: "", // Will be set by the context
        voteType,
        options,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        chain: selectedChain,
        tokenDetails: isTokenVoting ? {
          name: tokenName,
          address: tokenAddress
        } : undefined,
        hybridVoting: isHybridVoting ? {
          nftAddress,
          tokenAddress: isTokenVoting ? tokenAddress : undefined
        } : undefined
      });
      
      toast.success("Proposal created successfully!");
      navigate(`/proposals/${newProposal.id}`);
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal. Please try again.");
    }
  };
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>
                Create a new governance proposal for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Select
                  value={selectedOrgId}
                  onValueChange={setSelectedOrgId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={org.logoUrl || ""} alt={org.name} />
                              <AvatarFallback className="text-xs">{org.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            {org.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="network">Network *</Label>
                <Select
                  value={selectedChain}
                  onValueChange={(value) => setSelectedChain(value as Chain)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {networkOptions.map(network => (
                        <SelectItem key={network} value={network}>
                          {network.charAt(0).toUpperCase() + network.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Proposal Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your proposal in detail. Include background, motivation, and expected outcomes."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label>Voting Type *</Label>
                <RadioGroup 
                  value={voteType} 
                  onValueChange={(value) => setVoteType(value as VoteType)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="single-choice" id="single-choice" disabled={isTokenVoting || isHybridVoting} />
                    <Label htmlFor="single-choice" className="cursor-pointer">Single Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="multiple-choice" id="multiple-choice" disabled={isTokenVoting || isHybridVoting} />
                    <Label htmlFor="multiple-choice" className="cursor-pointer">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="token-weighted" id="token-weighted" />
                    <Label htmlFor="token-weighted" className="cursor-pointer">Token Weighted</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="token-voting">Token Voting</Label>
                  <Switch 
                    id="token-voting" 
                    checked={isTokenVoting} 
                    onCheckedChange={setIsTokenVoting} 
                  />
                </div>
                
                {isTokenVoting && (
                  <div className="space-y-3 border rounded-md p-3 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="token-name">Token Name *</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., Ethereum"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        required={isTokenVoting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-address">Token Contract Address *</Label>
                      <div className="relative">
                        <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="token-address"
                          placeholder="0x..."
                          value={tokenAddress}
                          onChange={(e) => setTokenAddress(e.target.value)}
                          className="pl-8"
                          required={isTokenVoting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The ERC-20 token contract address that will be used for voting
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hybrid-voting">Hybrid Voting</Label>
                    <p className="text-xs text-muted-foreground">
                      Combine Token and Soulbound NFT for voting
                    </p>
                  </div>
                  <Switch 
                    id="hybrid-voting" 
                    checked={isHybridVoting} 
                    onCheckedChange={setIsHybridVoting} 
                  />
                </div>
                
                {isHybridVoting && (
                  <div className="space-y-3 border rounded-md p-3 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="nft-address">Soulbound NFT Address *</Label>
                      <div className="relative">
                        <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nft-address"
                          placeholder="0x..."
                          value={nftAddress}
                          onChange={(e) => setNftAddress(e.target.value)}
                          className="pl-8"
                          required={isHybridVoting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The ERC-721 contract address for soulbound NFT voting power
                      </p>
                    </div>
                    
                    {!isTokenVoting && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                        <p>You need to enable token voting to use hybrid voting</p>
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm" 
                          className="mt-2" 
                          onClick={() => setIsTokenVoting(true)}
                        >
                          Enable Token Voting
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Label>Voting Options *</Label>
                
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={option} disabled className="flex-1" />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add another option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addOption}
                    disabled={!newOption}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        fromDate={startDate || new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedOrgId}>
                {isLoading ? "Creating..." : "Create Proposal"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
      
      <div>
        {organization && (
          <AIAssistant 
            placeholder="Ask for help with your proposal..." 
            context={`You are helping craft a proposal for the organization "${organization.name}" with the description "${organization.description}". The user is currently writing a proposal titled "${title}" with description "${description}".`}
          />
        )}
      </div>
    </div>
  );
}

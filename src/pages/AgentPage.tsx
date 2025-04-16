import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AgentSettings } from "@/components/ai/AgentSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { useAI } from "@/contexts/AIContext";
import { Bot, Check, Info, Plus, X } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { AIKeyInput } from "@/components/ai/AIKeyInput";

const AgentPage = () => {
  const { agentSettings, updateAgentSettings } = useAI();
  const { userPreferences, updateUserPreferences } = useData();
  
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  
  const addKeyword = () => {
    if (!keyword.trim()) return;
    
    const keywords = userPreferences?.keywords || [];
    if (!keywords.includes(keyword.trim())) {
      updateUserPreferences({ 
        keywords: [...keywords, keyword.trim()] 
      });
      setKeyword("");
      toast.success("Keyword added to preferences");
    }
  };
  
  const addCategory = () => {
    if (!category.trim()) return;
    
    const categories = userPreferences?.categories || [];
    if (!categories.includes(category.trim())) {
      updateUserPreferences({ 
        categories: [...categories, category.trim()] 
      });
      setCategory("");
      toast.success("Category added to preferences");
    }
  };
  
  const removeKeyword = (kw: string) => {
    const keywords = userPreferences?.keywords || [];
    updateUserPreferences({
      keywords: keywords.filter(k => k !== kw)
    });
    toast.success("Keyword removed from preferences");
  };
  
  const removeCategory = (cat: string) => {
    const categories = userPreferences?.categories || [];
    updateUserPreferences({
      categories: categories.filter(c => c !== cat)
    });
    toast.success("Category removed from preferences");
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Daisy AI Agent Settings</h1>
            <p className="text-muted-foreground">
              Configure how Daisy AI assists with your governance activities
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Daisy Status
                </CardTitle>
                <CardDescription>
                  Control the main agent settings and functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="agent-master">Agent Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all AI functionality
                    </p>
                  </div>
                  <Switch
                    id="agent-master"
                    checked={agentSettings.enabled}
                    onCheckedChange={(checked) => updateAgentSettings({ enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center gap-3 mt-6">
                  <div className={`h-3 w-3 rounded-full ${agentSettings.enabled ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {agentSettings.enabled ? 'Daisy AI is active and ready to assist' : 'Daisy AI is currently deactivated'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <AIKeyInput />
            
            <AgentSettings />
            
            <Card>
              <CardHeader>
                <CardTitle>Voting Preferences</CardTitle>
                <CardDescription>
                  Set preferences for automated voting and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-voting Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow Daisy AI to cast votes on your behalf based on your preferences
                      </p>
                    </div>
                    <Switch
                      checked={userPreferences?.autoVoteEnabled || false}
                      onCheckedChange={(checked) => {
                        updateUserPreferences({ autoVoteEnabled: checked });
                        updateAgentSettings({ autoVote: checked });
                      }}
                      disabled={!agentSettings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded border border-yellow-200 dark:border-yellow-900/30">
                    <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      With auto-voting enabled, Daisy AI will vote on proposals that match your specified preferences. 
                      You'll be notified before each automated vote.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-medium">Topics of Interest</h3>
                  <p className="text-sm text-muted-foreground">
                    Add categories that interest you to receive recommendations
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {(userPreferences?.categories || []).map((cat, i) => (
                      <Badge key={i} variant="secondary" className="pl-2">
                        {cat}
                        <button 
                          className="ml-1 rounded-full hover:bg-muted p-1" 
                          onClick={() => removeCategory(cat)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                    
                    {(userPreferences?.categories || []).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No categories added yet</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add a category..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addCategory} 
                      disabled={!category.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-medium">Keywords</h3>
                  <p className="text-sm text-muted-foreground">
                    Add keywords for proposals you want to automatically vote on
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {(userPreferences?.keywords || []).map((kw, i) => (
                      <Badge key={i} variant="outline" className="pl-2">
                        {kw}
                        <button 
                          className="ml-1 rounded-full hover:bg-muted p-1" 
                          onClick={() => removeKeyword(kw)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                    
                    {(userPreferences?.keywords || []).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No keywords added yet</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add a keyword..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addKeyword} 
                      disabled={!keyword.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-medium">Default Voting Stance</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your general stance on proposals when specific preferences don't apply
                  </p>
                  
                  <RadioGroup
                    defaultValue={(userPreferences?.preferredOutcomes?.default || "abstain").toString()}
                    onValueChange={(value) => {
                      updateUserPreferences({
                        preferredOutcomes: {
                          ...(userPreferences?.preferredOutcomes || {}),
                          default: parseInt(value)
                        }
                      });
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="0" id="option-yes" />
                      <Label htmlFor="option-yes" className="cursor-pointer">Generally For</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="1" id="option-no" />
                      <Label htmlFor="option-no" className="cursor-pointer">Generally Against</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="2" id="option-abstain" />
                      <Label htmlFor="option-abstain" className="cursor-pointer">Abstain</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <AIAssistant 
              placeholder="Ask about Daisy AI capabilities..."
              context="The user is configuring the Daisy AI agent settings and preferences for DAO governance. Help them understand how to best configure the AI agent and explain its capabilities for proposal summarization, automated voting, and governance assistance."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AgentPage;

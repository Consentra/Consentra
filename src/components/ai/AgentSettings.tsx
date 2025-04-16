
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAI } from '@/contexts/AIContext';

export function AgentSettings() {
  const { agentSettings, updateAgentSettings } = useAI();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Settings</CardTitle>
        <CardDescription>
          Configure how Daisy AI assists with your governance activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="agent-enabled">Enable AI Agent</Label>
            <p className="text-sm text-muted-foreground">
              Toggle all AI functionality on or off
            </p>
          </div>
          <Switch
            id="agent-enabled"
            checked={agentSettings.enabled}
            onCheckedChange={(checked) => updateAgentSettings({ enabled: checked })}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-vote">Automated Voting</Label>
            <p className="text-sm text-muted-foreground">
              Let Daisy AI vote based on your preferences
            </p>
          </div>
          <Switch
            id="auto-vote"
            checked={agentSettings.enabled && agentSettings.autoVote}
            onCheckedChange={(checked) => updateAgentSettings({ autoVote: checked })}
            disabled={!agentSettings.enabled}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-summarize">Proposal Summarization</Label>
            <p className="text-sm text-muted-foreground">
              Automatically generate summaries of proposals
            </p>
          </div>
          <Switch
            id="auto-summarize"
            checked={agentSettings.enabled && agentSettings.autoSummarize}
            onCheckedChange={(checked) => updateAgentSettings({ autoSummarize: checked })}
            disabled={!agentSettings.enabled}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Proposal Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new proposals in your organizations
            </p>
          </div>
          <Switch
            id="notifications"
            checked={agentSettings.enabled && agentSettings.notifyOnProposal}
            onCheckedChange={(checked) => updateAgentSettings({ notifyOnProposal: checked })}
            disabled={!agentSettings.enabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}

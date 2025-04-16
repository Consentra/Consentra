
import { useWallet } from "@/contexts/WalletContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CirclePlus, BarChart3, Vote, LucideCalendarCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserDashboard() {
  const { user } = useWallet();
  const { organizations, proposals, userData } = useData();
  const navigate = useNavigate();
  
  // Filter organizations where user is a member
  const userOrgs = organizations?.filter(org => 
    org.members.includes(user?.address || "")
  ) || [];
  
  // Filter proposals where user has voted
  const userVotes = proposals?.filter(proposal => 
    proposal.votes.some(vote => vote.voter === user?.address)
  ) || [];
  
  // Calculate user stats
  const stats = [
    {
      title: "Organizations",
      value: userOrgs.length,
      icon: <BarChart3 className="h-4 w-4" />,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Proposals Created",
      value: proposals?.filter(p => p.creator === user?.address).length || 0,
      icon: <CirclePlus className="h-4 w-4" />,
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "Votes Cast",
      value: userVotes.length,
      icon: <Vote className="h-4 w-4" />,
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: "Upcoming Votes",
      value: proposals?.filter(p => p.status === "active" && !p.votes.some(v => v.voter === user?.address)).length || 0,
      icon: <LucideCalendarCheck2 className="h-4 w-4" />,
      color: "bg-amber-500/10 text-amber-500"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>My Organizations</CardTitle>
            <CardDescription>
              Organizations you're a member of
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {userOrgs.length > 0 ? (
              <div className="divide-y">
                {userOrgs.slice(0, 5).map((org, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.chain}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/organizations/${org.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                You haven't joined any organizations yet
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 p-3">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/organizations')}>
              View All Organizations
            </Button>
          </CardFooter>
        </Card>
        
        {/* Recent Votes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent votes and proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {userVotes.length > 0 ? (
              <div className="divide-y">
                {userVotes.slice(0, 5).map((proposal, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/proposals/${proposal.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                You haven't voted on any proposals yet
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 p-3">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/proposals')}>
              View All Proposals
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

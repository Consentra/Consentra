import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/DataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User, Link, Image, Upload, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function UserProfileForm() {
  const { user } = useWallet();
  const { updateUserData, userData } = useData();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  
  // Load user data on component mount
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setBio(userData.bio || "");
      setEmail(userData.email || "");
      setWebsite(userData.website || "");
      setTwitter(userData.twitter || "");
      setGithub(userData.github || "");
      setAvatar(userData.avatar || "");
      setIsVerified(userData.isVerified || false);
      setVerificationStatus(userData.verificationStatus || "unverified");
      setIsPublicProfile(userData.isPublicProfile !== false);
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedUserData = {
        name,
        bio,
        email,
        website,
        twitter,
        github,
        avatar,
        isVerified,
        verificationStatus,
        isPublicProfile,
        address: user?.address || ""
      };
      
      // In a real app, this would make an API call to persist data
      await updateUserData(updatedUserData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleVerification = () => {
    // In a real application, this would trigger the verification process
    setVerificationStatus("pending");
    toast.success("Verification request submitted. Please check your email for further instructions.");
  };
  
  const getShortAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="profile">Profile Information</TabsTrigger>
        <TabsTrigger value="verification">Verification</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details and social links
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatar || ""} alt={name} />
                  <AvatarFallback>
                    <User className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">{name || "Your Name"}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{getShortAddress(user?.address || "")}</span>
                    {isVerified && (
                      <Badge variant="secondary" className="ml-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="avatar"
                    placeholder="Image URL"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                  <Button type="button" size="icon" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="Your website URL"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    placeholder="username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
      
      <TabsContent value="verification">
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Verify your identity to access additional features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Verification Status</h3>
                <p className="text-sm text-muted-foreground">
                  Your current verification level
                </p>
              </div>
              <Badge variant={verificationStatus === "verified" ? "secondary" : "outline"} className="capitalize">
                {verificationStatus}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Basic Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify your email address and connect your wallet
                    </p>
                    {verificationStatus === "unverified" ? (
                      <Button onClick={handleVerification} size="sm" className="mt-2">
                        Start Verification
                      </Button>
                    ) : (
                      <Badge variant="outline" className="mt-2">
                        {verificationStatus === "verified" ? "Completed" : "In Progress"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">SoulBound NFT</h4>
                    <p className="text-sm text-muted-foreground">
                      Mint a non-transferable identity NFT to your wallet
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" disabled={verificationStatus !== "verified"}>
                      {verificationStatus === "verified" ? "Mint NFT" : "Complete Basic Verification First"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile information
                </p>
              </div>
              <Switch 
                id="public-profile" 
                checked={isPublicProfile}
                onCheckedChange={setIsPublicProfile}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new proposals and votes
                </p>
              </div>
              <Switch id="notifications" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Building, Globe, Twitter, Github, Linkedin } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OrganizationProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrganization, organizations, isLoading } = useData();
  const { user } = useWallet();
  
  const [organization, setOrganization] = useState(getOrganization(id || ''));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [editing, setEditing] = useState(false);
  
  // Load organization data when component mounts
  useEffect(() => {
    if (id) {
      const org = getOrganization(id);
      setOrganization(org);
      
      if (org) {
        setName(org.name);
        setDescription(org.description);
        setWebsite(org.website);
        setTwitter(org.socialLinks?.twitter || '');
        setGithub(org.socialLinks?.github || '');
        setLinkedin(org.socialLinks?.linkedin || '');
        setLogoUrl(org.logoUrl || '');
      }
    }
  }, [id, organizations, getOrganization]);
  
  // Check if user is organization admin
  const isAdmin = organization?.creator === user?.address;
  
  const handleSave = () => {
    if (!organization) return;
    
    // In a real app, this would make an API call to update the organization
    // For demo purposes, we're just showing a toast
    toast.success("Organization profile updated!");
    setEditing(false);
  };
  
  if (!organization) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Organization not found</h2>
          <p className="text-muted-foreground mt-2">The organization you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/organizations')}
          >
            Back to Organizations
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {!editing ? (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={organization.logoUrl} alt={organization.name} />
                  <AvatarFallback>
                    <Building className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {organization.name}
              </>
            ) : (
              'Edit Organization Profile'
            )}
          </h1>
          
          {isAdmin && !editing && (
            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
        
        {editing ? (
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization's profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Enter URL of your organization logo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="github"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="organization"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="organization"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">About</h3>
                  <p className="text-muted-foreground">{organization.description}</p>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h3 className="text-lg font-medium">Details</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {organization.website}
                      </a>
                    </div>
                    
                    {organization.socialLinks?.twitter && (
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`https://twitter.com/${organization.socialLinks.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          @{organization.socialLinks.twitter}
                        </a>
                      </div>
                    )}
                    
                    {organization.socialLinks?.github && (
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`https://github.com/${organization.socialLinks.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {organization.socialLinks.github}
                        </a>
                      </div>
                    )}
                    
                    {organization.socialLinks?.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`https://linkedin.com/company/${organization.socialLinks.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {organization.socialLinks.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {organization.tokenName && (
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-lg font-medium">Governance Token</h3>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{organization.tokenName}</span>
                      {organization.tokenAddress && (
                        <span className="text-xs text-muted-foreground">
                          {organization.tokenAddress.substring(0, 6)}...{organization.tokenAddress.substring(organization.tokenAddress.length - 4)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

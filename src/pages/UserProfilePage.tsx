
import { AppLayout } from "@/components/layout/AppLayout";
import { UserProfileForm } from "@/components/users/UserProfileForm";
import { UserDashboard } from "@/components/users/UserDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserProfilePage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and preferences
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <UserProfileForm />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-4">
            <UserDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserProfilePage;

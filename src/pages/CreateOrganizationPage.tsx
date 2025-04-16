
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";

const CreateOrganizationPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Organization</h1>
        <p className="text-muted-foreground">
          Set up a DAO or governance organization on your preferred blockchain
        </p>
        
        <CreateOrganizationForm />
      </div>
    </AppLayout>
  );
};

export default CreateOrganizationPage;

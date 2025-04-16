
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateProposalForm } from "@/components/proposals/CreateProposalForm";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateProposalPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full h-8 w-8 p-0"
          >
            <Link to="/proposals">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Proposal</h1>
            <p className="text-muted-foreground">
              Create a proposal for your organization
            </p>
          </div>
        </div>
        
        <CreateProposalForm />
      </div>
    </AppLayout>
  );
};

export default CreateProposalPage;

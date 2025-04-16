
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, PlusCircle, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Organization } from "@/types";
import { Loading } from "@/components/ui/loading";
import { useWallet } from "@/contexts/WalletContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrganizationsPage = () => {
  const navigate = useNavigate();
  const { organizations, isLoading } = useData();
  const { user } = useWallet();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState<"all" | "member" | "created">("all");
  
  const filteredOrganizations = organizations.filter((org) => {
    // Apply search filter
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.description.toLowerCase().includes(searchTerm.toLowerCase());
                          
    // Apply membership filter
    let matchesMembership = true;
    if (filterOption === "member" && user) {
      matchesMembership = org.members.includes(user.address);
    } else if (filterOption === "created" && user) {
      matchesMembership = org.creator === user.address;
    }
    
    return matchesSearch && matchesMembership;
  });
  
  // For empty state messaging
  const hasOrganizations = organizations.length > 0;
  const hasFilteredOrganizations = filteredOrganizations.length > 0;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">
              Browse DAOs and governance organizations
            </p>
          </div>
          
          <Button
            onClick={() => navigate("/organizations/create")}
            className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={filterOption}
            onValueChange={(value) => setFilterOption(value as "all" | "member" | "created")}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="member">My Memberships</SelectItem>
                <SelectItem value="created">Created by Me</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <Loading message="Loading organizations..." />
        ) : !hasOrganizations ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No Organizations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first organization to get started
            </p>
            <Button
              onClick={() => navigate("/organizations/create")}
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white hover:opacity-90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </div>
        ) : !hasFilteredOrganizations ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterOption("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default OrganizationsPage;

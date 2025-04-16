
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Organization } from "@/types";
import { Building, Link, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link as RouterLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const { id, name, description, chain, tokenName, members, proposals, createdAt, logoUrl } = organization;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={logoUrl || ""} alt={name} />
              <AvatarFallback>
                <Building className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {name}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {chain}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{members.length} members</span>
        </div>
        
        {tokenName && (
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Token: {tokenName}</span>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Created {formatDate(createdAt)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm">
          {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
        </div>
        <Button asChild>
          <RouterLink to={`/organizations/${id}`}>View Details</RouterLink>
        </Button>
      </CardFooter>
    </Card>
  );
}

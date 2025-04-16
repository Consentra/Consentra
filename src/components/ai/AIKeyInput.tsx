
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Key, Check, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAI } from '@/contexts/AIContext';

export function AIKeyInput() {
  const { isApiKeyValid } = useAI();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Mistral AI Configuration
          {isApiKeyValid && (
            <Badge variant="secondary" className="ml-2">
              <Check className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Mistral AI API is configured for governance features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-primary" />
          <span>API key is securely embedded in the application</span>
        </div>
        
        {isApiKeyValid ? (
          <Alert variant="default">
            <Check className="h-4 w-4" />
            <AlertDescription>
              Your Mistral AI integration is active and ready to use
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              There is an issue with the Mistral AI API key. Please contact the administrator.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

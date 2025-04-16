
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet } from 'lucide-react';

export function WalletConnect() {
  const { connectWallet, isConnecting } = useWallet();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="space-y-2">
          <div className="h-16 w-16 mx-auto flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Consentra" 
              className="h-full w-full" 
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Consentra</h1>
          <p className="text-muted-foreground">
            AI-powered governance assistant for DAOs
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Connect Wallet to Continue</h2>
            <p className="text-sm text-muted-foreground">
              Please connect your MetaMask wallet to access Consentra's governance features.
            </p>
          </div>
          
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting} 
            size="lg"
            className="w-full bg-gradient-to-r from-brand-blue to-brand-teal hover:opacity-90"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Powered by Consentra • Secured by Hedera
        </p>
      </div>
    </div>
  );
}


import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/auth/WalletConnect';

interface WalletGuardProps {
  children: React.ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { user } = useWallet();
  
  if (!user?.isConnected) {
    return <WalletConnect />;
  }
  
  return <>{children}</>;
}

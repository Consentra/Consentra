
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '@/types';

interface WalletContextType {
  user: User | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  // Ensure React is properly imported and useState is being called correctly
  const [user, setUser] = React.useState<User | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Check if user was previously connected
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      checkConnection(storedAddress);
    }
  }, []);

  async function checkConnection(address: string) {
    try {
      // In a real implementation, you'd verify the wallet is still connected
      // For this example, we'll just set the user
      setUser({
        address,
        isConnected: true,
      });
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
      localStorage.removeItem('walletAddress');
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      if (address) {
        localStorage.setItem('walletAddress', address);
        setUser({
          address,
          isConnected: true,
        });
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    localStorage.removeItem('walletAddress');
    setUser(null);
    toast.success('Wallet disconnected');
  }

  return (
    <WalletContext.Provider value={{ user, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

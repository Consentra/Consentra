
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WalletGuard } from '@/components/auth/WalletGuard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const content = (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={cn(
        "flex-1", 
        !isHome && "container px-4 py-6 md:py-8"
      )}>
        <ScrollArea className="h-full">
          {children}
        </ScrollArea>
      </main>
      <Footer />
    </div>
  );
  
  if (requireAuth) {
    return <WalletGuard>{content}</WalletGuard>;
  }
  
  return content;
}

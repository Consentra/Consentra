import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Building, Home, LogOut, Menu, MessageSquarePlus, User, Bot, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Organizations', href: '/organizations', icon: Building },
    { name: 'Proposals', href: '/proposals', icon: MessageSquarePlus },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Agent', href: '/agent', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Consentra" 
              className="h-8 w-8"
            />
            <span className="font-bold text-xl tracking-tight">Consentra</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.isConnected ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {formatAddress(user.address)}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectWallet} 
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="bg-gradient-to-r from-brand-blue to-brand-teal hover:opacity-90"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="py-4">
                <Link to="/" className="flex items-center gap-2 mb-6">
                  <img 
                    src="/logo.png" 
                    alt="Consentra" 
                    className="h-8 w-8"
                  />
                  <span className="font-bold text-xl tracking-tight">Consentra</span>
                </Link>
                <Separator className="my-4" />
                <div className="flex flex-col gap-3">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                          isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

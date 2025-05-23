
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'الرئيسية',
      path: '/',
      icon: <Home className="h-5 w-5 ml-2" />,
    },
    {
      name: 'الموكلين',
      path: '/clients',
      icon: <Users className="h-5 w-5 ml-2" />,
    },
    {
      name: 'الضبط',
      path: '/settings',
      icon: <SettingsIcon className="h-5 w-5 ml-2" />,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-legal-primary">ميزان</div>
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  className={cn(
                    'flex items-center justify-center mx-1',
                    isActive(item.path) ? 'bg-legal-primary' : ''
                  )}
                  asChild
                >
                  <Link to={item.path}>
                    {item.icon}
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            ميزان - نظام إدارة مكتب المحاماة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

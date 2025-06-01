
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Settings as SettingsIcon, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  onPrint?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onPrint }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'الرئيسية',
      path: '/',
      icon: <Home className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />,
    },
    {
      name: 'الموكلين',
      path: '/clients',
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />,
    },
    {
      name: 'الضبط',
      path: '/settings',
      icon: <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto p-2 sm:p-4">
          <div className="flex justify-between items-center">
            <div className="text-xl sm:text-2xl font-bold text-legal-primary">أجندة</div>
            <div className="flex items-center gap-2">
              {onPrint && location.pathname === '/' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrint}
                  className="p-2"
                  title="طباعة جدول الأعمال"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              <nav className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'flex items-center justify-center mx-1 text-xs sm:text-sm px-2 sm:px-3',
                      isActive(item.path) ? 'bg-legal-primary' : ''
                    )}
                    asChild
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <span className="hidden sm:inline">{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        {children}
      </main>
      <footer className="bg-white border-t py-2 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            أجندة - نظام إدارة مكتب المحاماة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

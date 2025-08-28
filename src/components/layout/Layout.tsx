// src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../features/equipment-loan/utils';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  subtitle,
  className 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={title} 
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        <main className={cn(
          "flex-1 p-4 sm:p-6 overflow-auto",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};
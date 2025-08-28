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
    <div className="h-screen bg-zinc-950 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fixed Header */}
        <Header 
          title={title} 
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        {/* Scrollable Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          className
        )}>
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
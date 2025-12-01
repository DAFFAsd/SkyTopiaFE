'use client';

import { useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import AdminSidebar from './components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Desktop collapsed state (mini vs expanded)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  // Content margin follows sidebar width on desktop
  const contentMarginClass = isMobile
    ? ''
    : isCollapsed
      ? 'md:ml-20'
      : 'md:ml-64';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapsed={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className={`flex-1 overflow-y-auto p-8 relative transition-all duration-300 ${contentMarginClass}`}>
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-purple transition-colors"
            aria-label="Open sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <span className="text-brand-purple font-semibold">Admin Dashboard</span>
        </div>

        {children}
      </main>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Image from 'next/image';
import ParentSidebar from './components/Sidebar'; 
import { FiMenu } from 'react-icons/fi';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    // State harus sesuai dengan props yang diminta Sidebar.tsx
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            
            {/* 1. SIDEBAR */}
            {/* Kita panggil komponen Sidebar dan oper semua state yang dibutuhkan */}
            <ParentSidebar 
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* 2. MAIN CONTENT WRAPPER */}
            {/* Disini kuncinya: 
                - md:ml-64 = Memberi margin kiri 256px saat sidebar lebar
                - md:ml-20 = Memberi margin kiri 80px saat sidebar kecil (collapsed)
                - transition-all = Biar animasi gesernya halus
            */}
            <div className={`
                flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
                ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}
            `}>
                
                {/* MOBILE HEADER (Hanya muncul di layar HP) */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center">
                        <Image 
                            src="/skytopia-logo.svg" 
                            alt="SkyTopia" 
                            width={120} 
                            height={40} 
                            className="w-auto h-8"
                        />
                    </div>

                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-purple transition-colors"
                        aria-label="Buka Menu"
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
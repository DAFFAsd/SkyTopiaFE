'use client';

import { useState } from 'react';
import Image from 'next/image'; 
import ParentSidebar from './components/Sidebar'; 
import { FiMenu, FiX } from 'react-icons/fi';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)} 
                ></div>
            )}

            {/* SIDEBAR WRAPPER */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:shadow-none 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Close Button Mobile */}
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-red-500"
                >
                    <FiX className="h-6 w-6" />
                </button>

                <ParentSidebar onToggle={() => setIsSidebarOpen(false)} />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center">
                        <Image 
                            src="/skytopia-logo.svg" 
                            alt="SkyTopia" 
                            width={150} 
                            height={50} 
                            className="w-auto h-8"
                        />
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-purple transition-colors"
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>
                </div>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
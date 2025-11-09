// Import Image, FiSearch, dan FiBell udah dihapus
'use client';

import { useState } from 'react';
import TeacherSidebar from './components/Sidebar';
import { FiMenu } from 'react-icons/fi';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const [sidebarHidden, setSidebarHidden] = useState(false);

    const toggleSidebar = () => {
        setSidebarHidden(!sidebarHidden);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div className={`transition-all duration-300 ${sidebarHidden ? 'w-0' : 'w-64'}`}>
                {!sidebarHidden && <TeacherSidebar onToggle={toggleSidebar} />}
            </div>

            {/* DIV pembungkus <header> dan <main> udah dihapus.
                <main> sekarang jadi anak langsung dari <div flex ...>
            */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                {sidebarHidden && (
                    <button
                        onClick={toggleSidebar}
                        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        title="Tampilkan Sidebar"
                    >
                        <FiMenu className="h-5 w-5 text-gray-600" />
                    </button>
                )}
                {children}
            </main>
        </div>
    );
}
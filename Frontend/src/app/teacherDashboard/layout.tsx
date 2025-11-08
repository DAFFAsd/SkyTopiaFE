import TeacherSidebar from './components/Sidebar'; // <-- Ganti jadi TeacherSidebar
import Image from 'next/image';
import { FiSearch, FiBell } from 'react-icons/fi';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
        <TeacherSidebar />
        
        <div className="flex flex-1 flex-col">
            {/* Header Atas */}
            <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
            <div className="relative w-full max-w-md">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="h-5 w-5 text-gray-400" />
                </span>
                <input
                type="text"
                placeholder="Cari..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <div className="flex items-center space-x-4">
                <FiBell className="h-6 w-6 text-gray-500 hover:text-brand-purple" />
                <Image
                src="/avatars/andrew.svg" // <-- Nanti diganti pake data user
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
                />
            </div>
            </header>
            
            {/* Konten Halaman */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
        </div>
    );
}
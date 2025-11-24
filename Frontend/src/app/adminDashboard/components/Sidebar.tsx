// app/adminDashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import {
    FiHome,
    FiUser,
    FiCalendar,
    FiDollarSign,
    FiArrowLeftCircle,
    FiPackage,
    FiBarChart,
    FiUsers,
    FiClipboard, 
    FiFileText, 
    FiLogOut,
} from 'react-icons/fi';

const navLinks = [
    { name: 'Dashboard', href: '/adminDashboard', icon: FiHome },
    { name: 'Manajemen User', href: '/adminDashboard/users', icon: FiFileText },
    { name: 'Data Anak', href: '/adminDashboard/children', icon: FiUsers },
    { name: 'Laporan Harian', href: '/adminDashboard/daily-reports', icon: FiClipboard },
    { name: 'Manajemen Guru', href: '/adminDashboard/teacher-management', icon: FiUser },
    { name: 'Jadwal', href: '/adminDashboard/schedule', icon: FiCalendar },
    { name: 'Kurikulum', href: '/adminDashboard/curriculum', icon: FiCalendar },
    { name: 'Laporan Inventaris', href: '/adminDashboard/inventory-reports', icon: FiBarChart },
];

const bottomLinks = [
    { name: 'Tagihan', href: '/adminDashboard/billing', icon: FiDollarSign },
];

export default function AdminSidebar({ onToggle }: { onToggle: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/users/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            router.push('/login');
        }
    };

    return (
    <aside className="w-64 flex flex-col bg-sidebar-bg border-r border-gray-200  md:flex fixed h-screen px-6 py-6"> 
        
        <div className="mb-6 flex items-center justify-center flex-shrink-0">
            <Image src="/skytopia-logo.svg" alt="SkyTopia Logo" width={150} height={40} />
        </div>


        <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"> 

            <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/adminDashboard' && pathname.startsWith(link.href));
                    return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center space-x-3 rounded-lg p-3 text-sm font-medium
                            ${
                            isActive
                                ? 'bg-active-pink text-active-pink-text'
                                : 'text-sidebar-text hover:bg-gray-100'
                            }
                        `}
                    >
                        <link.icon className="h-5 w-5" />
                        <span>{link.name}</span>
                    </Link>
                    );
                })}
            </nav>

            <nav className="flex flex-col space-y-2">
                {bottomLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium
                                ${
                                    isActive
                                    ? 'bg-active-pink text-active-pink-text'
                                    : 'text-sidebar-text hover:bg-gray-100'
                                }
                            `}
                        >
                            <div className="flex items-center space-x-3">
                            <link.icon className="h-5 w-5" />
                            <span>{link.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
        
        <div className="flex flex-col space-y-4 pt-4 mt-auto border-t border-gray-200">
            <button
                onClick={onToggle}
                className="flex items-center space-x-3 p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full text-left"
            >
            <FiArrowLeftCircle className="h-5 w-5" />
            <span>Sembunyikan</span>
            </button>
            
            <button
                onClick={logout}
                className="flex items-center space-x-3 p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full text-left"
            >
            <FiLogOut className="h-5 w-5" />
            <span>Logout</span>
            </button>
            
            <div className="flex items-center justify-around text-sidebar-text">
            </div>
        </div>
    </aside>
    );
}
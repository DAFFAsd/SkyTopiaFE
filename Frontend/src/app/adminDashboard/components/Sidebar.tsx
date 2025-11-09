// app/adminDashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
    FiHome,
    FiGrid,
    FiUsers,
    FiUser,
    FiCalendar,
    FiDollarSign,
    FiArrowLeftCircle,
    FiFilter,
    FiAward,
    FiSettings,
    FiPackage,
    FiBarChart,
} from 'react-icons/fi';

// Admin sidebar mirrors the dashboard sidebar but with 'Anak' and 'Guru' removed
const navLinks = [
    { name: 'Dashboard', href: '/adminDashboard', icon: FiHome },
    { name: 'Guru', href: '/adminDashboard/teacher', icon: FiUser },
    { name: 'Kalender', href: '/adminDashboard/calendar', icon: FiCalendar },
    { name: 'Kurikulum dan Jadwal', href: '/adminDashboard/curriculum', icon: FiCalendar },
    { name: 'Permintaan Inventaris', href: '/adminDashboard/requests', icon: FiPackage },
    { name: 'Laporan Inventaris', href: '/adminDashboard/inventory-reports', icon: FiBarChart },
];

const bottomLinks = [
    { name: 'Tagihan', href: '/dashboard/billing', icon: FiDollarSign, badge: 3 },
];

export default function AdminSidebar({ onToggle }: { onToggle: () => void }) {
    const pathname = usePathname();

    return (
    <aside className="w-64 flex-col bg-sidebar-bg p-6 border-r border-gray-200 hidden md:flex fixed h-screen">
        <div className="flex-1">
            <div className="mb-10 flex items-center justify-center">
            <Image src="/skytopia-logo.svg" alt="SkyTopia Logo" width={150} height={40} />
        </div>

        {/* Navigasi Utama */}
        <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
                const isActive = pathname === link.href;
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
        </div>

        {/* Navigasi Bawah */}
        <div className="flex flex-col space-y-4">
            {bottomLinks.map((link) => (
            <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100"
            >
                <div className="flex items-center space-x-3">
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
                </div>
                {link.badge && (
                <span className="rounded-full bg-brand-purple px-2 py-0.5 text-xs text-white">
                    {link.badge}
                </span>
                )}
            </Link>
        ))}

        <hr />

            <button
                onClick={onToggle}
                className="flex items-center space-x-3 p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full text-left"
            >
            <FiArrowLeftCircle className="h-5 w-5" />
            <span>Sembunyikan</span>
            </button>

            <div className="flex items-center justify-around text-sidebar-text">
            <FiFilter className="h-5 w-5 hover:text-active-pink-text" />
            <FiAward className="h-5 w-5 hover:text-active-pink-text" />
            <FiSettings className="h-5 w-5 hover:text-active-pink-text" />
            </div>
        </div>
        </aside>
    );
}

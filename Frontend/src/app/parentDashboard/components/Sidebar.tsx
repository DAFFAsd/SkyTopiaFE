'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Import ikon-ikon yang kita butuhin
import {
    FiHome,
    FiUsers,
    FiClipboard,
    FiBookOpen,
    FiDollarSign,
    FiMessageSquare,
    FiArrowLeftCircle,
    FiSettings,
    } from 'react-icons/fi';

    // === NAVIGASI KHUSUS PARENT ===
    const navLinks = [
    { name: 'Dashboard', href: '/parentDashboard', icon: FiHome },
    { name: 'Anak Saya', href: '/parentDashboard/my-children', icon: FiUsers },
    { name: 'Laporan Harian', href: '/parentDashboard/daily-reports', icon: FiClipboard },
    { name: 'Laporan Semester', href: '/parentDashboard/semester-reports', icon: FiBookOpen },
    ];

    const bottomLinks = [
    { name: 'Tagihan', href: '/parentDashboard/billing', icon: FiDollarSign },
    { name: 'Chatbot', href: '/parentDashboard/chatbot', icon: FiMessageSquare },
    ];
    // =============================

    export default function ParentSidebar({ onToggle }: { onToggle: () => void }) {
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
                // Modifikasi: Cek /parentDashboard/my-children/[id]
                const isActive = pathname === link.href || (link.href !== '/parentDashboard' && pathname.startsWith(link.href));
                
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
                className={`flex items-center space-x-3 rounded-lg p-3 text-sm font-medium
                ${
                    pathname.startsWith(link.href)
                    ? 'bg-active-pink text-active-pink-text'
                    : 'text-sidebar-text hover:bg-gray-100'
                }
                `}
            >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
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
            {/* Ikon Setting (contoh) */}
            <FiSettings className="h-5 w-5 hover:text-active-pink-text" />
            </div>
        </div>
        </aside>
    );
}
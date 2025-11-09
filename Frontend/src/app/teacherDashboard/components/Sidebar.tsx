'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Import ikon-ikon yang kita butuhin
import {
    FiHome,
    FiClipboard,
    FiBookOpen,
    FiCheckSquare,
    FiCalendar,
    FiArchive,
    FiAlertTriangle,
    FiArrowLeftCircle,
    FiSettings,
    } from 'react-icons/fi';

    // === NAVIGASI KHUSUS TEACHER ===
    const navLinks = [
    { name: 'Dasbor', href: '/teacherDashboard', icon: FiHome },
    { name: 'Buat Laporan Harian', href: '/teacherDashboard/daily-report', icon: FiClipboard },
    { name: 'Buat Laporan Semester', href: '/teacherDashboard/semester-report', icon: FiBookOpen },
    { name: 'Absensi', href: '/teacherDashboard/attendance', icon: FiCheckSquare },
    { name: 'Jadwal & Kurikulum', href: '/teacherDashboard/schedules', icon: FiCalendar },
    ];

    const bottomLinks = [
    { name: 'Minta Inventaris', href: '/teacherDashboard/inventory-request', icon: FiArchive },
    { name: 'Lapor Fasilitas', href: '/teacherDashboard/facility-report', icon: FiAlertTriangle },
    ];
    // =============================

    export default function TeacherSidebar({ onToggle }: { onToggle: () => void }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-col bg-sidebar-bg p-6 border-r border-gray-200 hidden md:flex">
        <div className="flex-1">
            <div className="mb-10 flex items-center justify-center">
            <Image src="/skytopia-logo.svg" alt="SkyTopia Logo" width={150} height={40} />
            </div>

            {/* Navigasi Utama */}
            <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/teacherDashboard' && pathname.startsWith(link.href));
                
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
            <FiSettings className="h-5 w-5 hover:text-active-pink-text" />
            </div>
        </div>
        </aside>
    );
}
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
    FiHome,
    FiClipboard,
    FiBookOpen,
    FiCheckSquare,
    FiCalendar,
    FiArchive,
    FiAlertTriangle,
    FiArrowLeftCircle,
    FiUser 
} from 'react-icons/fi';

    const navLinks = [
    { name: 'Dashboard', href: '/teacherDashboard', icon: FiHome },
    { name: 'Anak Didik Saya', href: '/teacherDashboard/my-class', icon: FiUser },
    { name: 'Buat Laporan Harian', href: '/teacherDashboard/daily-report', icon: FiClipboard },
    { name: 'Buat Laporan Semester', href: '/teacherDashboard/semester-report', icon: FiBookOpen },
    { name: 'Absensi', href: '/teacherDashboard/attendance', icon: FiCheckSquare },
    { name: 'Jadwal & Kurikulum', href: '/teacherDashboard/schedules', icon: FiCalendar },
    ];

    const bottomLinks = [
    { name: 'Request Inventaris', href: '/teacherDashboard/inventory-request', icon: FiArchive },
    { name: 'Lapor Fasilitas', href: '/teacherDashboard/facility-report', icon: FiAlertTriangle },
    ];

    export default function TeacherSidebar({ onToggle }: { onToggle: () => void }) {
    const pathname = usePathname();

    return (
    <aside className="w-64 flex-col bg-sidebar-bg border-r border-gray-200 hidden md:flex fixed h-screen py-6 px-6"> {/* PADDING PINDAH KE SINI */}
        
        <div className="mb-6 flex items-center justify-center">
            <Image src="/skytopia-logo.svg" alt="SkyTopia Logo" width={150} height={40} />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"> 
            
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

            <nav className="flex flex-col space-y-2">
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
            </nav>
        </div>

        <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200 mt-auto">
            <button
                onClick={onToggle}
                className="flex items-center space-x-3 p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full text-left"
            >
            <FiArrowLeftCircle className="h-5 w-5" />
            <span>Sembunyikan</span>
            </button>
            
            <div className="flex items-center justify-around text-sidebar-text">
            </div>
        </div>
    </aside>
    );
}
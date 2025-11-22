'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
    FiHome,
    FiClipboard,
    FiBookOpen,
    FiCheckSquare,
    FiCalendar,
    FiArchive,
    FiAlertTriangle,
    FiArrowLeftCircle,
    FiUser,
    FiLogOut
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
    const router = useRouter();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
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
            setShowLogoutModal(false); 
        }
    };

    return (
    <>
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
            
            <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-3 p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full text-left"
            >
            <FiLogOut className="h-5 w-5" />
            <span>Logout</span>
            </button>
            
            <div className="flex items-center justify-around text-sidebar-text">
            </div>
        </div>
    </aside>
    {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 transform transition-all scale-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Konfirmasi Logout</h3>
                <p className="text-gray-600 mb-6 text-sm">Apakah Anda yakin ingin keluar dari aplikasi?</p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowLogoutModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={confirmLogout}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
    );
}
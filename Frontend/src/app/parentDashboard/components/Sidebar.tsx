'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
    FiHome,
    FiUsers,
    FiClipboard,
    FiBookOpen,
    FiDollarSign,
    FiMessageSquare,
    FiArrowLeftCircle,
    FiLogOut
} from 'react-icons/fi';

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

export default function ParentSidebar({
    isCollapsed,
    onToggleCollapsed,
    isMobileOpen,
    setIsMobileOpen,
}: {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi Mobile
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

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

    // Styling Class Dinamis
    const containerWidthClass = isMobile
        ? 'w-64'
        : isCollapsed
            ? 'w-20'
            : 'w-64';

    const asidePositionClass = isMobile
        ? (isMobileOpen ? 'left-0' : '-left-64')
        : 'left-0';

    // Padding yang menyesuaikan saat collapsed agar icon tetap di tengah
    const paddingClass = isCollapsed && !isMobile ? 'px-2' : 'px-6';

    const handleToggleClick = () => {
        if (isMobile) {
            setIsMobileOpen(false);
        } else {
            onToggleCollapsed();
        }
    };

    return (
        <>
            {/* Overlay Mobile */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`flex flex-col bg-sidebar-bg border-r border-gray-200 fixed h-screen py-6 z-50
                    ${containerWidthClass}
                    ${paddingClass}
                    transition-all duration-300 ease-in-out
                    ${asidePositionClass}
                `}
            >
                {/* Logo Area */}
                <div className="mb-6 flex items-center justify-center flex-shrink-0 min-h-[40px]">
                    {isCollapsed && !isMobile ? (
                        // Tampilkan Icon Kecil saat Collapsed
                        <Image 
                            src="/skytopia-icon.svg" 
                            alt="SkyTopia Icon" 
                            width={40} 
                            height={40}
                            className="flex-shrink-0 object-contain"
                        />
                    ) : (
                        // Tampilkan Logo Penuh saat Expanded
                        <Image 
                            src="/skytopia-logo.svg" 
                            alt="SkyTopia Logo" 
                            width={150} 
                            height={40}
                            className="flex-shrink-0 object-contain"
                        />
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                    <nav className="flex flex-col space-y-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/parentDashboard' && pathname.startsWith(link.href));
                            const collapsed = isCollapsed && !isMobile;

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex rounded-lg p-3 text-sm font-medium transition-colors
                                        ${collapsed ? 'justify-center' : 'justify-start items-center space-x-3'}
                                        ${isActive ? 'bg-active-pink text-active-pink-text' : 'text-sidebar-text hover:bg-gray-100'}
                                    `}
                                    title={collapsed ? link.name : undefined}
                                >
                                    <link.icon className="w-6 h-6 flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="truncate">{link.name}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Links & Actions */}
                <div className="flex flex-col space-y-2 pt-4 mt-auto border-t border-gray-200">
                    {bottomLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        const collapsed = isCollapsed && !isMobile;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex rounded-lg p-3 text-sm font-medium transition-colors
                                    ${collapsed ? 'justify-center' : 'justify-start items-center space-x-3'}
                                    ${isActive ? 'bg-active-pink text-active-pink-text' : 'text-sidebar-text hover:bg-gray-100'}
                                `}
                                title={collapsed ? link.name : undefined}
                            >
                                <link.icon className="w-6 h-6 flex-shrink-0" />
                                {!collapsed && (
                                    <span className="truncate">{link.name}</span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-2 flex flex-col space-y-2">
                        {/* Tombol Toggle Sidebar */}
                        <button
                            onClick={handleToggleClick}
                            className={`flex p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full transition-colors
                                ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start items-center space-x-3'}
                            `}
                            title={isCollapsed && !isMobile ? 'Perbesar Sidebar' : 'Sembunyikan Sidebar'}
                        >
                            <FiArrowLeftCircle className={`w-6 h-6 flex-shrink-0 transition-transform ${isCollapsed && !isMobile ? 'rotate-180' : ''}`} />
                            {(!isCollapsed || isMobile) && (
                                <span className="truncate">
                                    {isMobile ? 'Tutup Menu' : 'Sembunyikan'}
                                </span>
                            )}
                        </button>

                        {/* Tombol Logout */}
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className={`flex p-3 text-sm font-medium text-sidebar-text hover:bg-gray-100 rounded-lg w-full transition-colors
                                ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start items-center space-x-3'}
                            `}
                            title={isCollapsed && !isMobile ? 'Logout' : undefined}
                        >
                            <FiLogOut className="w-6 h-6 flex-shrink-0" />
                            {(!isCollapsed || isMobile) && (
                                <span className="truncate">Logout</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modal Logout (Di luar <aside> supaya fixed center layar) */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm transform transition-all scale-100">
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
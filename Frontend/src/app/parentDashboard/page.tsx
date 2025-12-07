'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    FiUsers, FiClipboard, FiDollarSign, FiBookOpen, 
    FiMessageSquare, 
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import PaymentChart from './components/PaymentChart';
import PageHeader from './components/PageHeader';
import { apiUrl } from '@/lib/api';

type Child = {
    _id: string;
    name: string;
    birth_date: string;
};

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

function FeatureCard({ title, href, icon: Icon, color, iconColor }: 
    { title: string; href: string; icon: IconType; color: string; iconColor: string }) {
    return (
        <Link
        href={href}
        className={`flex h-28 md:h-32 items-center space-x-4 rounded-xl p-5 md:p-6 transition-transform hover:scale-105 shadow-sm hover:shadow-md ${color}`}
        >
            <div className={`rounded-full bg-white p-3 flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <span className="text-base md:text-lg font-semibold text-brand-purple leading-tight">{title}</span>
        </Link>
    );
}

function ChildCard({ name, href }: { name: string; href: string }) {
    return (
        <Link
        href={href}
        className="flex h-28 md:h-32 items-center space-x-4 rounded-xl bg-stat-blue-bg/50 p-5 md:p-6 transition-transform hover:scale-105 shadow-sm hover:shadow-md"
        >
            <div className="rounded-full bg-white p-3 flex-shrink-0">
                <FiUsers className="h-6 w-6 text-sky-500" />
            </div>
            <div className="text-lg md:text-xl font-semibold text-brand-purple truncate">{name}</div>
        </Link>
    );
}


export default function ParentDashboardPage() {
    const [user] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        const userString = localStorage.getItem('user');
        if (userString) {
            return JSON.parse(userString);
        }
        return null;
    });

    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchData() {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (!token || !userString) {
            setError('Autentikasi gagal. Silakan login kembali.');
            setIsLoading(false);
            return;
        }
                
        const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        };

        try {
        const res = await fetch(apiUrl('/children/my-children'), { headers });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Gagal mengambil data anak');
        }
        
        setChildren(data.children);

        } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Terjadi kesalahan tidak terduga.');
        }
        } finally {
        setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                <span className="ml-2 text-gray-500">Memuat data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-center">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="relative rounded-xl shadow-sm border border-yellow-200 bg-welcome-yellow p-6 md:p-8 overflow-hidden">
                <div className="relative z-10 max-w-lg">
                    <h1 className="font-rammetto text-3xl text-brand-purple mb-2">
                        Halo, {user?.name || 'Orang Tua'}! 👋
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-brand-purple/90 leading-relaxed">
                        Selamat datang di SkyTopia. Pantau semua aktivitas, laporan, dan perkembangan buah hati Anda di sini.
                    </p>
                </div>
                <div className="absolute right-4 -bottom-4 hidden md:block opacity-90 hover:scale-105 transition-transform">
                    <Image
                        src="/woman-at-desk.svg"
                        alt="Ilustrasi"
                        width={180}
                        height={120}
                    />
                </div>
            </div>

            <div className="animate-fade-in-up">
                <h2 className="font-rammetto text-xl text-brand-purple mb-4">
                    Anak Anda
                </h2>
                {children.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {children.map((child) => (
                            <ChildCard
                                key={child._id}
                                name={child.name}
                                href={`/parentDashboard/my-children/${child._id}`} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Belum ada data anak yang terdaftar.</p>
                    </div>
                )}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-rammetto text-xl text-brand-purple mb-4">
                    Fitur Utama
                </h2>
                
                <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        title="Laporan Harian"
                        href="/parentDashboard/daily-reports"
                        icon={FiClipboard}
                        color="bg-stat-pink-bg"
                        iconColor="text-pink-500"
                    />
                    <FeatureCard
                        title="Laporan Semester"
                        href="/parentDashboard/semester-reports"
                        icon={FiBookOpen}
                        color="bg-stat-blue-bg/50"
                        iconColor="text-sky-500"
                    />
                    <FeatureCard
                        title="Tagihan"
                        href="/parentDashboard/billing"
                        icon={FiDollarSign}
                        color="bg-stat-pink-bg"
                        iconColor="text-pink-500"
                    />
                    <FeatureCard
                        title="Tanya Chatbot"
                        href="/parentDashboard/chatbot"
                        icon={FiMessageSquare}
                        color="bg-stat-blue-bg/50"
                        iconColor="text-sky-500"
                    />
                </div>
            </div>
            
            {/* Payment Chart */}
            <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-rammetto text-xl text-brand-purple mb-4">
                    Ringkasan Pembayaran Tahunan
                </h2>
                <div className="bg-white rounded-xl shadow-md border border-gray-200">
                    <PaymentChart /> 
                </div>
            </div>

        </div>
    );
}
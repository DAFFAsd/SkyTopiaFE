'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    FiUsers, FiClipboard, FiDollarSign, FiBookOpen, 
    FiMessageSquare, 
} from 'react-icons/fi';
import { IconType } from 'react-icons';

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
        className={`flex h-32 items-center space-x-4 rounded-xl p-6 transition-transform hover:scale-105 ${color}`}
        >
            <div className={`rounded-full bg-white p-3`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <span className="text-lg font-semibold text-brand-purple">{title}</span>
        </Link>
    );
}

function ChildCard({ name, href }: { name: string; href: string }) {
    return (
        <Link
        href={href}
        className="flex h-32 items-center space-x-4 rounded-xl bg-stat-blue-bg/50 p-6 transition-transform hover:scale-105"
        >
            <div className="rounded-full bg-white p-3">
                <FiUsers className="h-6 w-6 text-sky-500" />
            </div>
            <div className="text-xl font-semibold text-brand-purple">{name}</div>
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
        const res = await fetch('http://localhost:3000/api/children/my-children', { headers });
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
        return <div className="text-center text-gray-500 p-10">Memuat data...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="relative rounded-xl shadow-sm border border-yellow-200 bg-welcome-yellow p-8 overflow-hidden">
                <div className="max-w-md">
                    <h3 className="font-semibold text-3xl text-brand-purple">
                        Halo, {user?.name || 'Orang Tua'}!
                    </h3>
                    <p className="mt-2 text-brand-purple/90">
                        Selamat datang di SkyTopia. Pantau semua aktivitas buah hati Anda di sini.
                    </p>
                </div>
                <div className="absolute right-10 -bottom-8 hidden lg:block opacity-80">
                    <Image
                        src="/woman-at-desk.svg"
                        alt="Ilustrasi"
                        width={200}
                        height={130}
                    />
                </div>
            </div>

            <div>
                <h3 className="font-rammetto text-2xl font-bold text-brand-purple mb-4">Anak Anda</h3>
                {children.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                    <ChildCard
                        key={child._id}
                        name={child.name}
                        href={`/parentDashboard/my-children/${child._id}`} 
                    />
                    ))}
                </div>
                ) : (
                <p className="text-gray-500">Belum ada data anak.</p>
                )}
            </div>

            <div>
                <h3 className="font-rammetto text-2xl font-bold text-brand-purple mb-4">Fitur Utama</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
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
                        title="Tagihan & Pembayaran"
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
        </div>
    );
}
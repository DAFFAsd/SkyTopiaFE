'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiUsers, FiClipboard, FiDollarSign } from 'react-icons/fi';

// Tipe data (ditebak dari controller lo)
type Child = {
    _id: string;
    name: string;
    birth_date: string;
    // tambahin properti lain kalo perlu
    };

    type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    };

    // Komponen Card Anak (Mirip AdminTile)
    function ChildCard({ name, href }: { name: string; href: string }) {
    return (
        <Link
        href={href}
        className="flex h-40 items-center space-x-4 rounded-lg bg-stat-blue-bg/50 p-6 transition-transform hover:scale-105"
        >
        <div className="rounded-full bg-white p-3 text-2xl">
            <FiUsers className="h-6 w-6 text-sky-500" />
        </div>
        <div className="text-lg font-semibold text-brand-purple">{name}</div>
        </Link>
    );
    }

    export default function ParentDashboardPage() {
    // State buat nyimpen data
    const [user, setUser] = useState<User | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi buat ngambil data dari API
    async function fetchData() {
        setIsLoading(true);
        setError(null);
        
        // 1. Ambil token & user dari localStorage
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (!token || !userString) {
        setError('Autentikasi gagal. Silakan login kembali.');
        setIsLoading(false);
        // Di aplikasi beneran, lo bisa redirect ke /login
        // window.location.href = '/login';
        return;
        }
        
        setUser(JSON.parse(userString));
        
        // 2. Siapin header Authorization
        const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        };

        try {
        // 3. Panggil API getMyChildren
        // Pake URL relatif /api/... karena Next.js bisa nge-proxy
        // (Asumsi base URL backend lo http://localhost:3000)
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

    // Panggil fetchData() pas komponen di-load
    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-center text-gray-500">Memuat data...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
        {/* Banner Sambutan */}
        <div className="relative rounded-lg bg-welcome-yellow p-8">
            <div className="max-w-md">
            <h3 className="text-2xl font-semibold text-brand-purple ml-5">
                Halo, {user?.name || 'Orang Tua'}!
            </h3>
            <p className="mt-2 text-brand-purple ml-5">
                Selamat datang di SkyTopia. Pantau semua aktivitas buah hati Anda di sini.
            </p>
            </div>
            <div className="absolute right-20 top-3 bottom-0 hidden lg:block">
            <Image
                src="/woman-at-desk.svg"
                alt="Ilustrasi"
                width={150}
                height={100}
            />
            </div>
        </div>

        {/* Daftar Anak */}
        <div>
            <h3 className="text-xl font-bold text-brand-purple mb-4">Anak Anda</h3>
            {children.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                <ChildCard
                    key={child._id}
                    name={child.name}
                    href={`/parentDashboard/my-children/${child._id}`} // Halaman detail anak (Nanti kita bikin)
                />
                ))}
            </div>
            ) : (
            <p className="text-gray-500">Belum ada data anak.</p>
            )}
        </div>
        
        {/* Link Cepat (Contoh) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/parentDashboard/daily-reports" className="flex h-32 items-center space-x-4 rounded-lg bg-stat-pink-bg p-6 transition-transform hover:scale-105">
                <FiClipboard className="h-8 w-8 text-pink-500" />
                <span className="text-lg font-semibold text-brand-purple">Lihat Laporan Harian</span>
            </Link>
            <Link href="/parentDashboard/billing" className="flex h-32 items-center space-x-4 rounded-lg bg-stat-blue-bg/50 p-6 transition-transform hover:scale-105">
                <FiDollarSign className="h-8 w-8 text-sky-500" />
                <span className="text-lg font-semibold text-brand-purple">Lihat Riwayat Tagihan</span>
            </Link>
        </div>
        
        </div>
    );
}
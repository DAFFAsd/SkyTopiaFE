'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { FiArrowLeft, FiUser, FiLoader } from 'react-icons/fi';
import { apiUrl } from '@/lib/api';

// Tipe data buat 'getAllChildren'
interface Schedule {
    teacher: {
        _id: string;
        name: string;
    };
    }
    interface Child {
    _id: string;
    name: string;
    gender: string;
    birth_date: string;
    schedules: Schedule[];
    }
    interface User {
    id: string;
    role: string;
    name: string;
    }

    export default function MyClassPage() {
    const [myChildren, setMyChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyClass = async () => {
        try {
            const token = localStorage.getItem('token');
            const userJson = localStorage.getItem('user');
            
            if (!token || !userJson) {
            throw new Error('Token atau data user tidak ditemukan. Silakan login kembali.');
            }
            
            // Ambil ID Guru dari localStorage
            const currentUser: User = JSON.parse(userJson);
            const teacherId = currentUser.id;

            // 1. Fetch SEMUA anak
            const response = await fetch(apiUrl('/children'), {
            headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();

            if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil data anak');
            }

            // 2. Filter di frontend (ini yang kita omongin)
            const allChildren: Child[] = data.children;
            
            // Debug logging
            console.log('=== DEBUG MY CLASS ===');
            console.log('Teacher ID:', teacherId);
            console.log('Total children from API:', allChildren.length);
            
            const filteredChildren = allChildren.filter(child => {
                // Cek apakah child punya schedules
                if (!child.schedules || !Array.isArray(child.schedules) || child.schedules.length === 0) {
                    console.log(`${child.name}: Tidak ada schedules atau schedules bukan array`);
                    return false;
                }
                
                // Cek setiap schedule
                const hasMatchingSchedule = child.schedules.some(schedule => {
                    // Safety check: pastikan schedule dan teacher exist
                    if (!schedule || !schedule.teacher || !schedule.teacher._id) {
                        console.log(`${child.name}: Schedule atau teacher data tidak lengkap`, schedule);
                        return false;
                    }
                    
                    const scheduleTeacherId = schedule.teacher._id.toString().trim();
                    const currentTeacherId = teacherId.toString().trim();
                    const match = scheduleTeacherId === currentTeacherId;
                    
                    console.log(`${child.name}: Comparing`, {
                        scheduleTeacherId,
                        currentTeacherId,
                        match
                    });
                    
                    return match;
                });
                
                if (hasMatchingSchedule) {
                    console.log(`✅ ${child.name}: MATCH!`);
                }
                
                return hasMatchingSchedule;
            });
            
            console.log('Filtered children count:', filteredChildren.length);
            console.log('Filtered children:', filteredChildren.map(c => c.name));
            console.log('======================');

            setMyChildren(filteredChildren);

        } catch (err: unknown) {
            let errorMessage = "Terjadi kesalahan";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
        };

        fetchMyClass();
    }, []);

    return (
        <div className="space-y-6">
        <Link
            href="/teacherDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <PageHeader title="Anak Didik Saya" description="Daftar siswa di kelas Anda" />

        {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {isLoading ? (
            <div className="text-center text-gray-500">
            <FiLoader className="h-8 w-8 mx-auto animate-spin text-brand-purple" />
            Memuat data...
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {myChildren.length > 0 ? (
                myChildren.map(child => (
                <Link 
                    href={`/teacherDashboard/my-class/${child._id}`} 
                    key={child._id}
                    className="block rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:shadow-lg hover:border-login-pink"
                >
                    <div className="flex flex-col items-center">
                    {/* Placeholder Avatar */}
                    <div className="h-24 w-24 rounded-full bg-stat-pink-bg flex items-center justify-center mb-4">
                        <FiUser className="h-12 w-12 text-pink-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-purple">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.gender}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Lahir: {new Date(child.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    </div>
                </Link>
                ))
            ) : (
                <p className="text-gray-500 col-span-full text-center">
                Anda belum ditugaskan ke jadwal anak manapun.
                </p>
            )}
            </div>
        )}
        </div>
    );
}
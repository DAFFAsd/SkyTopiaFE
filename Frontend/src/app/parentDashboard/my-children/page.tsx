'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiCalendar, FiHeart } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { apiUrl } from '@/lib/api';

interface Schedule {
    _id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher?: {
        name: string;
    };
    curriculum?: {
        title: string;
    };
}

interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: string;
    medical_notes?: string;
    monthly_fee: number;
    semester_fee: number;
    schedules: Schedule[];
}

export default function MyChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch(apiUrl('/children/my-children'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
            } else {
                setError(data.message || 'Gagal mengambil data anak');
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            setError('Terjadi kesalahan saat mengambil data anak');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Anak Saya" />

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <div className="text-gray-600">Memuat data anak...</div>
                </div>
            ) : children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children.map((child) => (
                        <Link
                            key={child._id}
                            href={`/parentDashboard/my-children/${child._id}`}
                            className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-brand-purple transition-all"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                                        <FiUser className="h-8 w-8 text-brand-purple" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-semibold text-brand-purple mb-2">
                                        {child.name}
                                    </h3>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <FiCalendar className="h-4 w-4" />
                                            <span>{formatDate(child.birth_date)} ({calculateAge(child.birth_date)} tahun)</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <FiUser className="h-4 w-4" />
                                            <span>{child.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}</span>
                                        </div>

                                        {child.medical_notes && (
                                            <div className="flex items-start space-x-2">
                                                <FiHeart className="h-4 w-4 mt-0.5" />
                                                <span className="text-xs text-gray-500">{child.medical_notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    {child.schedules && child.schedules.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Jadwal:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {child.schedules.slice(0, 3).map((schedule) => (
                                                    <span
                                                        key={schedule._id}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {schedule.day}
                                                    </span>
                                                ))}
                                                {child.schedules.length > 3 && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{child.schedules.length - 3} lagi
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 text-right">
                                        <span className="text-sm text-brand-purple font-medium hover:underline">
                                            Lihat Detail →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <p className="text-gray-600">
                        Belum ada data anak terdaftar.
                    </p>
                </div>
            )}
        </div>
    );
}
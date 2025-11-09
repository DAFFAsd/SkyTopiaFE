'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiCalendar, FiHeart, FiDollarSign, FiClock, FiMapPin, FiBook } from 'react-icons/fi';
import { useParams } from 'next/navigation';

interface Teacher {
    _id: string;
    name: string;
    email?: string;
}

interface Curriculum {
    _id: string;
    title: string;
    description?: string;
    grade?: string;
}

interface Schedule {
    _id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    location?: string;
    teacher?: Teacher;
    curriculum?: Curriculum;
}

interface Parent {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: string;
    medical_notes?: string;
    monthly_fee: number;
    semester_fee: number;
    parent_id: Parent;
    schedules: Schedule[];
}

export default function ChildDetailPage() {
    const params = useParams();
    const { id } = params;

    const [child, setChild] = useState<Child | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchChildDetail();
        }
    }, [id]);

    const fetchChildDetail = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch(`http://localhost:3000/api/children/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setChild(data.child);
            } else {
                setError(data.message || 'Gagal mengambil data anak');
            }
        } catch (error) {
            console.error('Error fetching child detail:', error);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const sortedSchedules = child?.schedules.sort((a, b) => {
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Link
                    href="/parentDashboard/my-children"
                    className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Anak</span>
                </Link>
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <div className="text-gray-600">Memuat data anak...</div>
                </div>
            </div>
        );
    }

    if (error || !child) {
        return (
            <div className="space-y-6">
                <Link
                    href="/parentDashboard/my-children"
                    className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Anak</span>
                </Link>
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error || 'Data anak tidak ditemukan'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                href="/parentDashboard/my-children"
                className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
            >
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Daftar Anak</span>
            </Link>

            <h1 className="text-3xl font-bold text-brand-purple">
                Detail Anak: {child.name}
            </h1>

            {/* Child Info Card */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                            <FiUser className="h-12 w-12 text-brand-purple" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-brand-purple mb-4">{child.name}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                                <FiCalendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Lahir</p>
                                    <p className="font-medium text-brand-purple">
                                        {formatDate(child.birth_date)} ({calculateAge(child.birth_date)} tahun)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiUser className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Jenis Kelamin</p>
                                    <p className="font-medium text-brand-purple">
                                        {child.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiDollarSign className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Biaya Bulanan</p>
                                    <p className="font-medium text-brand-purple">{formatCurrency(child.monthly_fee)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiDollarSign className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Biaya Semester</p>
                                    <p className="font-medium text-brand-purple">{formatCurrency(child.semester_fee)}</p>
                                </div>
                            </div>
                        </div>

                        {child.medical_notes && (
                            <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <FiHeart className="h-5 w-5 text-pink-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Catatan Medis</p>
                                        <p className="text-sm text-gray-600 mt-1">{child.medical_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-brand-purple mb-6">Jadwal Kegiatan</h3>

                {sortedSchedules && sortedSchedules.length > 0 ? (
                    <div className="space-y-4">
                        {sortedSchedules.map((schedule) => (
                            <div
                                key={schedule._id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-brand-purple transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-brand-purple mb-2">
                                            {schedule.title}
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <FiCalendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{schedule.day}</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <FiClock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </span>
                                            </div>

                                            {schedule.location && (
                                                <div className="flex items-center space-x-2">
                                                    <FiMapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">{schedule.location}</span>
                                                </div>
                                            )}

                                            {schedule.teacher && (
                                                <div className="flex items-center space-x-2">
                                                    <FiUser className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        Guru: {schedule.teacher.name}
                                                    </span>
                                                </div>
                                            )}

                                            {schedule.curriculum && (
                                                <div className="flex items-center space-x-2 md:col-span-2">
                                                    <FiBook className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        Kurikulum: {schedule.curriculum.title}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">
                        Belum ada jadwal untuk anak ini.
                    </p>
                )}
            </div>
        </div>
    );
}
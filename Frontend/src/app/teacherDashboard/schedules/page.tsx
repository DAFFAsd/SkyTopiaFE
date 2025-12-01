'use client';

import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiLoader, FiBook } from 'react-icons/fi';

interface Schedule {
    _id: string;
    title: string;
    curriculum: {
        _id: string;
        title: string;
        description: string;
    };
    date: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher: {
        name: string;
        _id: string;
    };
}

interface Curriculum {
    _id: string;
    title: string;
    description: string;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [teacherId, setTeacherId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get user ID from token (decode JWT)
        let userId: string | null = null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId;
            setTeacherId(userId);
        } catch (err) {
            console.error('Failed to decode token:', err);
        }

        // Fetch data
        fetchSchedules(token, userId);
        fetchCurriculum(token);
    }, []);

    const fetchSchedules = async (token: string, userId: string | null) => {
        try {
            const response = await fetch('http://localhost:3000/api/schedules', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Filter schedules for current teacher using the passed userId
                const teacherSchedules = data.schedules.filter(
                    (schedule: Schedule) => schedule.teacher?._id === userId
                );
                console.log('Teacher ID:', userId);
                console.log('All schedules:', data.schedules);
                console.log('Filtered teacher schedules:', teacherSchedules);
                setSchedules(teacherSchedules);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
            setError('Gagal mengambil data jadwal');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurriculum = async (token: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/curriculums', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setCurriculum(data.curriculums || []);
            }
        } catch (err) {
            console.error('Failed to fetch curriculum:', err);
        }
    };

    // Calendar helper functions
    const getDaysInWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const startDate = new Date(d.setDate(diff));
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            days.push(currentDay);
        }
        return days;
    };

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const getSchedulesForDay = (date: Date) => {
        return schedules.filter(s => {
            if (!s.date) return false;
            const scheduleDate = new Date(s.date);
            return scheduleDate.toDateString() === date.toDateString();
        }).sort((a, b) => 
            a.startTime.localeCompare(b.startTime)
        );
    };

    const previousWeek = () => {
        setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    };

    const nextWeek = () => {
        setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    };

    const timeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const getEventPosition = (startTime: string) => {
        const minutes = timeToMinutes(startTime);
        const topPercent = (minutes / (24 * 60)) * 100;
        return topPercent;
    };

    const getEventHeight = (startTime: string, endTime: string) => {
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;
        const heightPercent = (duration / (24 * 60)) * 100;
        return Math.max(heightPercent, 5);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <PageHeader title="Jadwal & Kurikulum" description="Lihat agenda kegiatan dan materi ajar" />
                <div className="flex justify-center items-center py-12">
                    <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <PageHeader title="Jadwal & Kurikulum" description="Lihat agenda kegiatan dan materi ajar" />

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Calendar Header */}
            <div className="rounded-lg bg-white shadow-sm p-6">
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FiChevronLeft className="h-6 w-6 text-brand-purple" />
                    </button>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <h2 className="text-xl font-semibold text-gray-900 text-center">
                            {getDaysInWeek(currentDate)[0].toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}{' '}
                            -{' '}
                            {getDaysInWeek(currentDate)[6].toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </h2>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap"
                        >
                            Minggu Ini
                        </button>
                        <input
                            type="month"
                            value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                            onChange={(e) => {
                                const [year, month] = e.target.value.split('-');
                                setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                            }}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FiChevronRight className="h-6 w-6 text-brand-purple" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {getDaysInWeek(currentDate).map((day, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Day Header */}
                            <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white p-3 text-center">
                                <div className="text-sm font-semibold">{dayNames[day.getDay()]}</div>
                                <div className="text-2xl font-bold">{day.getDate()}</div>
                            </div>

                            {/* Day Content - Schedule List */}
                            <div className="p-3 bg-gray-50 min-h-96 space-y-2 overflow-y-auto">
                                {getSchedulesForDay(day).length > 0 ? (
                                    getSchedulesForDay(day).map((schedule) => (
                                        <div
                                            key={schedule._id}
                                            className="bg-white p-3 rounded-lg border-l-4 border-brand-purple hover:shadow-lg transition cursor-pointer group"
                                        >
                                            <div className="text-xs font-bold text-brand-purple mb-1">
                                                {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 truncate">
                                                {schedule.title}
                                            </div>
                                            <div className="text-xs text-gray-600 truncate">
                                                {schedule.curriculum?.title}
                                            </div>
                                            {schedule.curriculum?.description && (
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {schedule.curriculum.description}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 text-xs py-16">
                                        Tidak ada jadwal
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-white shadow-sm p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiBook className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Jadwal Minggu Ini</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {getDaysInWeek(currentDate).reduce((sum, day) => sum + getSchedulesForDay(day).length, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow-sm p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiBook className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Jadwal</p>
                            <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow-sm p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FiBook className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Kurikulum</p>
                            <p className="text-2xl font-bold text-gray-900">{curriculum.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum List */}
            {curriculum.length > 0 && (
                <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-purple to-purple-600">
                        <h3 className="text-lg font-semibold text-white">Kurikulum yang Saya Ampu</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {curriculum.map((curr) => (
                            <div key={curr._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{curr.title}</h4>
                                        <p className="text-sm text-gray-600 mt-2">{curr.description}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                            {schedules.filter(s => s.curriculum?._id === curr._id).length} Jadwal
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {schedules.length === 0 && (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <FiBook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Belum ada jadwal yang di-assign</p>
                    <p className="text-gray-500 text-sm mt-1">Admin akan mengassign jadwal pembelajaran untuk Anda</p>
                </div>
            )}
        </div>
    );
}
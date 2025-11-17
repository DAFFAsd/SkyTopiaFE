'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiBook } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { Child, Schedule } from '../types';
import { formatTime } from '../utils/formatters';

export default function SchedulesPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login kembali.');
            }

            const response = await fetch('http://localhost:3000/api/children/my-children', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil data');
            }

            if (data.success) {
                setChildren(data.children);
                if (data.children.length > 0) {
                    setSelectedChildId(data.children[0]._id);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(errorMessage);
            console.error('Error fetching children:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedChild = children.find(c => c._id === selectedChildId);
    
    // Group schedules by day
    const groupedSchedules = selectedChild?.schedules.reduce((acc, schedule) => {
        if (!acc[schedule.day]) {
            acc[schedule.day] = [];
        }
        acc[schedule.day].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);

    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    return (
        <div className="space-y-6">
            <PageHeader title="Jadwal Kegiatan" />

            {error && <ErrorMessage message={error} />}

            {children.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Anak
                    </label>
                    <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                    >
                        {children.map(child => (
                            <option key={child._id} value={child._id}>
                                {child.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {isLoading ? (
                <LoadingSpinner message="Memuat jadwal..." />
            ) : selectedChild?.schedules && selectedChild.schedules.length > 0 ? (
                <div className="space-y-4">
                    {dayOrder.map(day => {
                        const schedules = groupedSchedules?.[day];
                        if (!schedules || schedules.length === 0) return null;

                        return (
                            <div key={day} className="rounded-lg bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-brand-purple mb-4 flex items-center">
                                    <FiCalendar className="h-5 w-5 mr-2" />
                                    {day}
                                </h3>
                                <div className="space-y-3">
                                    {schedules.map(schedule => (
                                        <div 
                                            key={schedule._id} 
                                            className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="h-10 w-10 rounded-full bg-brand-purple/10 flex items-center justify-center">
                                                    <FiBook className="h-5 w-5 text-brand-purple" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                                                {schedule.curriculum && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {schedule.curriculum.title}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center space-x-1">
                                                        <FiClock className="h-4 w-4" />
                                                        <span>
                                                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                        </span>
                                                    </span>
                                                    {schedule.teacher && (
                                                        <span className="flex items-center space-x-1">
                                                            <FiUser className="h-4 w-4" />
                                                            <span>{schedule.teacher.name}</span>
                                                        </span>
                                                    )}
                                                    {schedule.location && (
                                                        <span className="flex items-center space-x-1">
                                                            <FiMapPin className="h-4 w-4" />
                                                            <span>{schedule.location}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
                    Belum ada jadwal kegiatan untuk anak ini.
                </div>
            )}
        </div>
    );
}

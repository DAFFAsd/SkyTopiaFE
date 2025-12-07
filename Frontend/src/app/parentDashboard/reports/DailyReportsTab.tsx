'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiHeart, FiCoffee, FiActivity } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { DailyReport, Child } from '../types';
import { formatDateWithDay, formatDateTime, getHealthStatusColor, getMoodColor, translateHealthStatus, translateMood } from '../utils/formatters';
import { apiUrl } from '@/lib/api';

export default function DailyReportsTab() {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchReports(selectedChild);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
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
                if (data.children.length > 0) {
                    setSelectedChild(data.children[0]._id);
                }
            } else {
                setError(data.message || 'Gagal mengambil data anak');
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            setError('Terjadi kesalahan saat mengambil data anak');
        }
    };

    const fetchReports = async (childId: string) => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch(apiUrl(`/daily-reports/child/${childId}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setReports(data.reports);
            } else {
                setError(data.message || 'Gagal mengambil laporan harian');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Terjadi kesalahan saat mengambil laporan harian');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {children.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Anak
                    </label>
                    <select
                        id="child-select"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                    >
                        {children.map((child) => (
                            <option key={child._id} value={child._id}>
                                {child.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && <ErrorMessage message={error} />}

            {isLoading ? (
                <LoadingSpinner message="Memuat laporan harian..." />
            ) : reports.length > 0 ? (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report._id} className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <FiCalendar className="h-5 w-5 text-brand-purple" />
                                    <span className="text-lg font-semibold text-brand-purple">
                                        {formatDateWithDay(report.date)}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusColor(report.healthStatus)}`}>
                                        <FiHeart className="h-3 w-3 mr-1" />
                                        {translateHealthStatus(report.healthStatus)}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodColor(report.mood)}`}>
                                        {translateMood(report.mood)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <FiActivity className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Aktivitas Harian</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.activities}</p>
                                        </div>
                                    </div>

                                    {report.meals && (
                                        <div className="flex items-start space-x-3">
                                            <FiCoffee className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Makanan</h4>
                                                <p className="text-sm text-gray-600 mt-1">{report.meals}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {report.notes && (
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Catatan Tambahan</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Laporan dibuat pada {formatDateTime(report.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <p className="text-gray-600">
                        Belum ada laporan harian untuk anak ini.
                    </p>
                </div>
            )}
        </div>
    );
}

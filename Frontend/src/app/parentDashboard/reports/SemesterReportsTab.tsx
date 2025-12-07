'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { SemesterReport, Child } from '../types';
import { formatDateTime } from '../utils/formatters';
import { apiUrl } from '@/lib/api';

export default function SemesterReportsTab() {
    const [reports, setReports] = useState<SemesterReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChildren();
        fetchReports();
    }, []);

    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(apiUrl('/children/my-children'), {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    };

    const fetchReports = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch(apiUrl('/semester-reports/my-child-reports'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setReports(data.reports || []);
            } else {
                setError(data.message || 'Gagal mengambil laporan semester');
            }
        } catch (error) {
            console.error('Error fetching semester reports:', error);
            setError('Terjadi kesalahan saat mengambil laporan semester');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReports = selectedChild
        ? reports.filter(r => r.child._id === selectedChild)
        : reports;

    return (
        <div className="space-y-4">
            {children.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <label htmlFor="semester-child-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter berdasarkan Anak (Opsional)
                    </label>
                    <select
                        id="semester-child-select"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                    >
                        <option value="">Semua Anak</option>
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
                <LoadingSpinner message="Memuat laporan semester..." />
            ) : filteredReports.length > 0 ? (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <div key={report._id} className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-purple mb-2">
                                        {report.child.name}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center space-x-1">
                                            <FiCalendar className="h-4 w-4" />
                                            <span>Semester {report.semester} - {report.year}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <FiUser className="h-4 w-4" />
                                            <span>{report.teacher.name}</span>
                                        </span>
                                    </div>
                                </div>
                                <FiFileText className="h-8 w-8 text-brand-purple" />
                            </div>

                            <div className="space-y-4">
                                {report.cognitive_development && (
                                    <div className="border-l-4 border-blue-400 pl-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Perkembangan Kognitif
                                        </h4>
                                        <p className="text-sm text-gray-600">{report.cognitive_development}</p>
                                    </div>
                                )}

                                {report.social_emotional_development && (
                                    <div className="border-l-4 border-pink-400 pl-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Perkembangan Sosial & Emosional
                                        </h4>
                                        <p className="text-sm text-gray-600">{report.social_emotional_development}</p>
                                    </div>
                                )}

                                {report.physical_development && (
                                    <div className="border-l-4 border-green-400 pl-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Perkembangan Fisik
                                        </h4>
                                        <p className="text-sm text-gray-600">{report.physical_development}</p>
                                    </div>
                                )}

                                {report.language_development && (
                                    <div className="border-l-4 border-purple-400 pl-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Perkembangan Bahasa
                                        </h4>
                                        <p className="text-sm text-gray-600">{report.language_development}</p>
                                    </div>
                                )}

                                {report.overall_notes && (
                                    <div className="border-l-4 border-yellow-400 pl-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Catatan Keseluruhan
                                        </h4>
                                        <p className="text-sm text-gray-600">{report.overall_notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    Dibuat: {formatDateTime(report.createdAt)}
                                </p>
                                {report.updatedAt && report.updatedAt !== report.createdAt && (
                                    <p className="text-xs text-gray-500">
                                        Diperbarui: {formatDateTime(report.updatedAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <p className="text-gray-600">
                        Belum ada laporan semester tersedia.
                    </p>
                </div>
            )}
        </div>
    );
}

"use client";

import Link from 'next/link';
import { 
    FiArrowLeft, FiCalendar, FiActivity, FiBookOpen, 
    FiSunrise, FiMoon, FiFileText, FiHeart, FiUser, FiCoffee 
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Child {
    _id: string;
    name: string;
}
interface Teacher {
    _id: string;
    name: string;
    email: string;
}

// --- (2) INTERFACE DAILY REPORT DIBENERIN ---
interface DailyReport {
    _id: string;
    child_id: Child;
    teacher_id: Teacher;
    date: string;
    theme: string;
    sub_theme: string;
    physical_motor: string;
    cognitive: string;
    social_emotional: string;
    meals?: { // <-- Diganti jadi object
        snack: string;
        lunch: string;
    };
    nap_duration: string;
    special_notes: string;
    createdAt: string;
}
// ------------------------------------------

export default function DailyReportsPage() {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- (fetchChildren & fetchReports SAMA PERSIS) ---
    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }
            const response = await fetch('http://localhost:3000/api/children/my-children', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
                if (data.children.length > 0) {
                    setSelectedChildId(data.children[0]._id);
                }
            } else {
                setError(data.message || 'Gagal mengambil data anak');
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            setError('Terjadi kesalahan saat mengambil data anak');
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
            const response = await fetch(`http://localhost:3000/api/daily-reports/my-child-reports`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                const sortedReports = data.reports.sort((a: DailyReport, b: DailyReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setReports(sortedReports);
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
    
    useEffect(() => {
        fetchChildren(); 
    }, []);

    useEffect(() => {
        if (children.length > 0) { 
            fetchReports();
        }
    }, [children]); 
    
    const filteredReports = reports.filter(report => report.child_id._id === selectedChildId);

    const formatDate = (dateString: string) => {
         return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <Link
                href="/parentDashboard"
                className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
            >
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <h1 className="font-rammetto text-3xl font-bold text-brand-purple">
                Laporan Harian
            </h1>

            {/* --- Kotak Filter Anak (SAMA) --- */}
            {children.length > 0 && (
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-brand-purple mb-3">
                        Tampilkan laporan untuk:
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {children.map((child) => (
                            <button
                                key={child._id}
                                onClick={() => setSelectedChildId(child._id)}
                                className={`
                                    flex items-center space-x-2 rounded-lg py-2 px-4 font-semibold
                                    transition-all duration-200 ease-in-out border
                                    ${
                                      selectedChildId === child._id
                                        ? 'bg-login-pink text-white shadow-lg transform scale-105 border-transparent'
                                        : 'bg-white text-brand-purple border-gray-200 hover:bg-pink-50 hover:border-pink-300'
                                    }
                                `}
                            >
                                <FiUser className="h-4 w-4" />
                                <span>{child.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                    <div className="text-gray-600">Memuat laporan harian...</div>
                </div>
            ) : 
            filteredReports.length > 0 ? (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <div key={report._id} className="rounded-xl bg-white p-6 shadow-sm border border-brand-purple/20">
                            {/* Header Laporan (SAMA) */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <FiCalendar className="h-5 w-5 text-brand-purple" />
                                    <span className="text-lg font-semibold text-brand-purple">
                                        {formatDate(report.date)}
                                    </span>
                                </div>
                                <span className="text-xs text-login-pink font-medium">
                                    Dibuat oleh: {report.teacher_id.name}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                
                                {/* --- (3) KOLOM KIRI (DITAMBAHIN MEALS) --- */}
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <FiBookOpen className="h-5 w-5 text-login-pink mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-purple">Tema Hari Ini</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.theme || '-'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{report.sub_theme || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* --- BLOK MEALS BARU --- */}
                                    {/* Cek dulu kalo 'meals' ada, karena data lama nggak punya */}
                                    {report.meals && (
                                        <div className="flex items-start space-x-3">
                                            <FiCoffee className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-brand-purple">Makanan</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Camilan:</span> {report.meals.snack || '-'}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Makan Siang:</span> {report.meals.lunch || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {/* --- AKHIR BLOK MEALS --- */}

                                    <div className="flex items-start space-x-3">
                                        <FiMoon className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-purple">Tidur Siang</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.nap_duration || '-'} Menit</p>
                                        </div>
                                    </div>

                                    {report.special_notes && (
                                        <div className="flex items-start space-x-3">
                                            <FiFileText className="h-5 w-5 text-brand-purple mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-brand-purple">Catatan Khusus dari Guru</h4>
                                                <p className="text-sm text-gray-600 mt-1">{report.special_notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Kolom Kanan (SAMA) */}
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <FiActivity className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-purple">Fisik & Motorik</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.physical_motor || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <FiHeart className="h-5 w-5 text-login-pink mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-purple">Sosial & Emosional</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.social_emotional || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <FiSunrise className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-purple">Kognitif</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.cognitive || '-'}</p>
                                        </div>
                                    </div>
                                </div>
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
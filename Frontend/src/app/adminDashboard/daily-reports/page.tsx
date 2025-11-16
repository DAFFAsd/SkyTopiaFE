'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    FiArrowLeft, FiSearch, FiBookOpen, FiLoader, FiUser, 
    FiFilter,  FiSmile, FiZap, FiMessageSquare, FiCoffee, 
} from 'react-icons/fi'; // Menambahkan beberapa ikon baru

// --- (1) TIPE DATA SESUAI BACKEND ---
interface Child {
    _id: string;
    name: string;
}
interface Teacher {
    _id: string;
    name: string;
    email: string;
}
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
    meals?: { snack: string; lunch: string; }; 
    nap_duration: string;
    special_notes: string;
    createdAt: string;
}
// ------------------------------------

export default function AdminDailyReportsPage() {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]); // Data untuk filter anak
    const [teachers, setTeachers] = useState<Teacher[]>([]); // Data untuk filter guru
    
    const [filterChildId, setFilterChildId] = useState('');
    const [filterTeacherId, setFilterTeacherId] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [allReports, setAllReports] = useState<DailyReport[]>([]); // Menyimpan semua data mentah

    // --- (2) FETCH DATA UTAMA (Reports, Anak, Guru) ---
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');
            
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Laporan Harian (Admin Endpoint)
            const reportsRes = await fetch('http://localhost:3000/api/daily-reports', { headers });
            const reportsData = await reportsRes.json();
            
            // Fetch Data Anak (Untuk Filter Dropdown)
            const childrenRes = await fetch('http://localhost:3000/api/children', { headers });
            const childrenData = await childrenRes.json();

            if (reportsData.success) {
                const fetchedReports: DailyReport[] = reportsData.reports;
                setAllReports(fetchedReports);
                setReports(fetchedReports); // Awalnya tampilkan semua
                
                // Ekstrak list unik guru dari laporan untuk filter dropdown
                const uniqueTeachersMap = new Map<string, Teacher>();
                fetchedReports.forEach(r => {
                    if (r.teacher_id) {
                        uniqueTeachersMap.set(r.teacher_id._id, r.teacher_id);
                    }
                });
                setTeachers(Array.from(uniqueTeachersMap.values()));
            } else {
                throw new Error(reportsData.message || 'Gagal mengambil semua laporan harian');
            }
            
            if (childrenData.success) {
                setChildren(childrenData.children);
            }

        } catch (err: unknown) {
            let errorMessage = "Terjadi kesalahan saat mengambil data.";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- (3) LOGIC FILTER DI FRONTEND ---
    useEffect(() => {
        let filtered = allReports;

        if (filterChildId) {
            filtered = filtered.filter(r => r.child_id && r.child_id._id === filterChildId);
        }
        if (filterTeacherId) {
            filtered = filtered.filter(r => r.teacher_id && r.teacher_id._id === filterTeacherId);
        }
        
        // Urutkan dari yang terbaru (tanggal laporan)
        const sortedReports = filtered.sort((a: DailyReport, b: DailyReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReports(sortedReports);
    }, [filterChildId, filterTeacherId, allReports]);


    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6 lg:p-8">
            <Link
                href="/adminDashboard"
                className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
            >
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <h1 className="font-rammetto text-3xl font-bold text-brand-purple">
                Laporan Harian Anak Didik
            </h1>
            <p className="text-gray-600 text-lg">Pantau aktivitas, perkembangan, dan kebahagiaan setiap anak.</p>


            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
            )}

            {/* --- (4) FILTER BAR --- */}
            <div className="rounded-xl bg-gradient-to-br from-login-pink/10 to-brand-purple/10 p-6 shadow-lg border border-brand-purple/20">
                <div className="flex items-center space-x-3 text-brand-purple font-rammetto text-xl mb-4">
                    <FiFilter className="h-6 w-6 text-login-pink" />
                    <span>Saring Laporan</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filter Anak */}
                    <div>
                        <label htmlFor="childFilter" className="block text-sm font-medium text-gray-700">Pilih Anak Didik</label>
                        <select
                            id="childFilter"
                            value={filterChildId}
                            onChange={(e) => setFilterChildId(e.target.value)}
                            className="w-full rounded-lg border-login-pink/50 shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors mt-1 bg-white p-2"
                        >
                            <option value="">Semua Anak</option>
                            {children.map(child => (
                                <option key={child._id} value={child._id}>{child.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Filter Guru */}
                    <div>
                        <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700">Pilih Guru</label>
                        <select
                            id="teacherFilter"
                            value={filterTeacherId}
                            onChange={(e) => setFilterTeacherId(e.target.value)}
                            className="w-full rounded-lg border-login-pink/50 shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors mt-1 bg-white p-2"
                        >
                            <option value="">Semua Guru</option>
                            {teachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Total Laporan Ditemukan */}
                    <div className="flex items-end">
                        <div className="rounded-lg bg-brand-purple text-white p-4 w-full border border-brand-purple/50 shadow-md">
                            <p className="text-xs font-light opacity-80">Total Laporan Ditemukan</p>
                            <p className="text-2xl font-bold font-rammetto">{reports.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- (5) REPORTS LIST --- */}
            {isLoading ? (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center border border-gray-200">
                    <div className="flex justify-center items-center text-brand-purple">
                        <FiLoader className="h-8 w-8 animate-spin mr-3" />
                        <span className="text-lg">Memuat laporan harian...</span>
                    </div>
                </div>
            ) : reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Layout grid untuk card */}
                    {reports.map((report) => (
                        <div key={report._id} className="rounded-xl bg-white p-6 shadow-lg border border-login-pink/30 hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 ease-in-out">
                            {/* Header Laporan */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-purple/20">
                                <div className="flex items-center space-x-3">
                                    <FiUser className="h-6 w-6 text-brand-purple" />
                                    <span className="text-xl font-rammetto text-brand-purple">
                                        {report.child_id.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-login-pink font-medium block">
                                        Guru: <strong>{report.teacher_id.name}</strong>
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Tanggal: {formatDate(report.date)}
                                    </span>
                                </div>
                            </div>

                            {/* Konten Detil */}
                            <div className="space-y-4 text-sm">
                                {/* Tema */}
                                <div className="p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                    <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                        <FiBookOpen className="h-4 w-4 mr-2 text-login-pink" /> Tema Hari Ini
                                    </h5>
                                    <p className="text-gray-700">
                                        <span className="font-bold">{report.theme || 'Tidak Ada Tema'}</span> - {report.sub_theme || 'Tidak Ada Sub-tema'}
                                    </p>
                                </div>
                                
                                {/* Perkembangan Fisik & Kognitif */}
                                <div className="p-3 bg-login-pink/5 rounded-lg border border-login-pink/10">
                                    <h5 className="font-semibold text-login-pink flex items-center mb-1">
                                        <FiZap className="h-4 w-4 mr-2 text-brand-purple" /> Perkembangan
                                    </h5>
                                    <p className="text-gray-700">
                                        <span className="font-bold">Motorik:</span> {report.physical_motor || 'Tidak Ada Catatan'}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-bold">Kognitif:</span> {report.cognitive || 'Tidak Ada Catatan'}
                                    </p>
                                </div>

                                {/* Sosial-Emosional & Tidur */}
                                <div className="p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                    <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                        <FiSmile className="h-4 w-4 mr-2 text-login-pink" /> Perilaku & Istirahat
                                    </h5>
                                    <p className="text-gray-700">
                                        <span className="font-bold">Sosem:</span> {report.social_emotional || 'Tidak Ada Catatan'}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-bold">Tidur Siang:</span> {report.nap_duration ? `${report.nap_duration} Menit` : 'Tidak Ada Catatan'}
                                    </p>
                                </div>

                                {/* Makanan */}
                                {(report.meals?.snack || report.meals?.lunch) && (
                                    <div className="p-3 bg-login-pink/5 rounded-lg border border-login-pink/10">
                                        <h5 className="font-semibold text-login-pink flex items-center mb-1">
                                            <FiCoffee className="h-4 w-4 mr-2 text-brand-purple" /> Waktu Makan
                                        </h5>
                                        {report.meals?.snack && <p className="text-gray-700"><span className="font-bold">Snack:</span> {report.meals.snack}</p>}
                                        {report.meals?.lunch && <p className="text-gray-700"><span className="font-bold">Makan Siang:</span> {report.meals.lunch}</p>}
                                    </div>
                                )}
                            </div>
                            
                            {/* Catatan Khusus */}
                            {report.special_notes && (
                                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 p-3 rounded-b-lg">
                                    <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                        <FiMessageSquare className="h-4 w-4 mr-2 text-login-pink" /> Catatan Khusus Guru
                                    </h5>
                                    <p className="text-sm text-gray-600 italic leading-relaxed">{report.special_notes}</p>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 shadow-sm text-center border border-gray-200">
                    <p className="text-gray-600 text-lg">
                        Tidak ada laporan harian yang ditemukan untuk filter ini. Coba ubah filter di atas ya. 
                    </p>
                    <FiSearch className="h-12 w-12 text-gray-300 mx-auto mt-4" />
                </div>
            )}
        </div>
    );
}
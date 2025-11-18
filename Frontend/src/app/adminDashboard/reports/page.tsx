// Centralized Report Viewer Page - Admin Dashboard (merged Daily + Semester)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    FiFileText, FiCalendar, FiFilter, FiLoader, FiUser, 
    FiBookOpen, FiSmile, FiZap, FiMessageSquare, FiCoffee 
} from 'react-icons/fi';
import { DailyReport, SemesterReport, Teacher } from '../types/report.types';
import { Child } from '../types/child.types';
import { getAllDailyReports, getAllSemesterReports } from '../services/reportService';
import { getAllChildren } from '../services/childService';
import SemesterReportsTab from '../components/SemesterReportsTab';

type TabType = 'daily' | 'semester';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('daily');

    // Daily reports state
    const [allDailyReports, setAllDailyReports] = useState<DailyReport[]>([]);
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filterChildId, setFilterChildId] = useState('');
    const [filterTeacherId, setFilterTeacherId] = useState('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isLoadingDaily, setIsLoadingDaily] = useState(true);
    const [errorDaily, setErrorDaily] = useState('');

    // Semester reports state
    const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
    const [isLoadingSemester, setIsLoadingSemester] = useState(true);
    const [errorSemester, setErrorSemester] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
        setIsLoadingDaily(true);
        setIsLoadingSemester(true);
        setErrorDaily('');
        setErrorSemester(null);

        try {
            const [daily, semester, childrenData] = await Promise.all([
                getAllDailyReports(),
                getAllSemesterReports(),
                getAllChildren()
            ]);

            // Daily + teachers
            setAllDailyReports(daily);
            setDailyReports(daily);
            const uniqueTeachers = new Map<string, Teacher>();
            daily.forEach(r => { if (r.teacher_id) uniqueTeachers.set(r.teacher_id._id, r.teacher_id); });
            setTeachers(Array.from(uniqueTeachers.values()));

            // Children
            setChildren(childrenData);

            // Semester
            setSemesterReports(semester);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal memuat data';
            setErrorDaily(msg);
            setErrorSemester(msg);
        } finally {
            setIsLoadingDaily(false);
            setIsLoadingSemester(false);
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    useEffect(() => {
        // Apply filters to daily reports
        let filtered = [...allDailyReports];
        if (filterChildId) filtered = filtered.filter(r => r.child_id && r.child_id._id === filterChildId);
        if (filterTeacherId) filtered = filtered.filter(r => r.teacher_id && r.teacher_id._id === filterTeacherId);
        if (startDate) filtered = filtered.filter(r => new Date(r.date) >= new Date(startDate));
        if (endDate) filtered = filtered.filter(r => new Date(r.date) <= new Date(endDate));
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setDailyReports(filtered);
    }, [filterChildId, filterTeacherId, startDate, endDate, allDailyReports]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-rammetto text-3xl text-brand-purple">Semua Laporan Anak Didik</h1>
                <p className="text-gray-600 mt-1">Pantau aktivitas, perkembangan, dan kebahagiaan anak — termasuk laporan harian & semester.</p>
            </div>

            {/* Summary Cards */}
            <div className="bg-gradient-to-br from-brand-purple/5 to-login-pink/5 rounded-xl p-6 border border-brand-purple/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FiFileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Laporan Harian</p>
                                <p className="text-2xl font-semibold text-gray-900">{isLoadingDaily ? '...' : allDailyReports.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <FiCalendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Laporan Semester</p>
                                <p className="text-2xl font-semibold text-gray-900">{isLoadingSemester ? '...' : semesterReports.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <FiFileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Anak Terdaftar</p>
                                <p className="text-2xl font-semibold text-gray-900">{children.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-4 px-6">
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'daily' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <FiFileText className="h-5 w-5" />
                                <span>Laporan Harian</span>
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{allDailyReports.length}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('semester')}
                            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'semester' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <FiCalendar className="h-5 w-5" />
                                <span>Laporan Semester</span>
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{semesterReports.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'daily' ? (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="rounded-xl bg-gradient-to-br from-login-pink/10 to-brand-purple/10 p-6 shadow-lg border border-brand-purple/20">
                                <div className="flex items-center space-x-3 text-brand-purple font-rammetto text-xl mb-4">
                                    <FiFilter className="h-6 w-6 text-login-pink" />
                                    <span>Saring Laporan</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <div>
                                        <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700">Pilih Guru</label>
                                        <select
                                            id="teacherFilter"
                                            value={filterTeacherId}
                                            onChange={(e) => setFilterTeacherId(e.target.value)}
                                            className="w-full rounded-lg border-login-pink/50 shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors mt-1 bg-white p-2"
                                        >
                                            <option value="">Semua Guru</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="rounded-lg bg-brand-purple text-white p-4 w-full border border-brand-purple/50 shadow-md">
                                            <p className="text-xs font-light opacity-80">Total Laporan Ditemukan</p>
                                            <p className="text-2xl font-bold font-rammetto">{dailyReports.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                                        <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border-login-pink/50 shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors mt-1 bg-white p-2" />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                                        <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border-login-pink/50 shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors mt-1 bg-white p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            {errorDaily && (
                                <div className="rounded-lg bg-red-50 p-4 text-red-700">{errorDaily}</div>
                            )}

                            {isLoadingDaily ? (
                                <div className="rounded-lg bg-white p-8 shadow-sm text-center border border-gray-200">
                                    <div className="flex justify-center items-center text-brand-purple">
                                        <FiLoader className="h-8 w-8 animate-spin mr-3" />
                                        <span className="text-lg">Memuat laporan harian...</span>
                                    </div>
                                </div>
                            ) : dailyReports.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {dailyReports.map((report) => (
                                        <div key={report._id} className="rounded-xl bg-white p-6 shadow-lg border border-login-pink/30 hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 ease-in-out">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-purple/20">
                                                <div className="flex items-center space-x-3">
                                                    <FiUser className="h-6 w-6 text-brand-purple" />
                                                    <span className="text-xl font-rammetto text-brand-purple">{report.child_id.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm text-login-pink font-medium block">Guru: <strong>{report.teacher_id.name}</strong></span>
                                                    <span className="text-xs text-gray-500">Tanggal: {formatDate(report.date)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 text-sm">
                                                <div className="p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                                    <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                                        <FiBookOpen className="h-4 w-4 mr-2 text-login-pink" /> Tema Hari Ini
                                                    </h5>
                                                    <p className="text-gray-700"><span className="font-bold">{report.theme || 'Tidak Ada Tema'}</span>{' '} - {report.sub_theme || 'Tidak Ada Sub-tema'}</p>
                                                </div>

                                                <div className="p-3 bg-login-pink/5 rounded-lg border border-login-pink/10">
                                                    <h5 className="font-semibold text-login-pink flex items-center mb-1">
                                                        <FiZap className="h-4 w-4 mr-2 text-brand-purple" /> Perkembangan
                                                    </h5>
                                                    <p className="text-gray-700"><span className="font-bold">Motorik:</span> {report.physical_motor || 'Tidak Ada Catatan'}</p>
                                                    <p className="text-gray-700"><span className="font-bold">Kognitif:</span> {report.cognitive || 'Tidak Ada Catatan'}</p>
                                                </div>

                                                <div className="p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                                    <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                                        <FiSmile className="h-4 w-4 mr-2 text-login-pink" /> Perilaku & Istirahat
                                                    </h5>
                                                    <p className="text-gray-700"><span className="font-bold">Sosem:</span> {report.social_emotional || 'Tidak Ada Catatan'}</p>
                                                    <p className="text-gray-700"><span className="font-bold">Tidur Siang:</span> {report.nap_duration ? `${report.nap_duration} Menit` : 'Tidak Ada Catatan'}</p>
                                                </div>

                                                {(report.meals?.snack || report.meals?.lunch) && (
                                                    <div className="p-3 bg-login-pink/5 rounded-lg border border-login-pink/10">
                                                        <h5 className="font-semibold text-login-pink flex items-center mb-1">
                                                            <FiCoffee className="h-4 w-4 mr-2 text-brand-purple" /> Waktu Makan
                                                        </h5>
                                                        {report.meals?.snack && (<p className="text-gray-700"><span className="font-bold">Snack:</span> {report.meals.snack}</p>)}
                                                        {report.meals?.lunch && (<p className="text-gray-700"><span className="font-bold">Makan Siang:</span> {report.meals.lunch}</p>)}
                                                    </div>
                                                )}

                                                {report.special_notes && (
                                                    <div className="mt-2 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-b-lg">
                                                        <h5 className="font-semibold text-brand-purple flex items-center mb-1">
                                                            <FiMessageSquare className="h-4 w-4 mr-2 text-login-pink" /> Catatan Khusus Guru
                                                        </h5>
                                                        <p className="text-sm text-gray-600 italic leading-relaxed">{report.special_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-white p-8 shadow-sm text-center border border-gray-200">
                                    <p className="text-gray-600 text-lg">Tidak ada laporan harian yang ditemukan untuk filter ini. Coba ubah filter di atas ya.</p>
                                    <FiFileText className="h-12 w-12 text-gray-300 mx-auto mt-4" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <SemesterReportsTab reports={semesterReports} children={children} isLoading={isLoadingSemester} />
                    )}
                </div>
            </div>
        </div>
    );
}

// Semester Reports Tab Component
'use client';

import { useCallback, useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiEye, FiStar, FiHeart, FiCpu, FiMessageCircle, FiActivity, FiEdit2, FiShield, FiPenTool, FiFileText } from 'react-icons/fi';
import { SemesterReport } from '../types/report.types';
import { Child } from '../types/child.types';

interface SemesterReportsTabProps {
    reports: SemesterReport[];
    children: Child[];
    isLoading: boolean;
}

export default function SemesterReportsTab({ reports, children, isLoading }: SemesterReportsTabProps) {
    const [filteredReports, setFilteredReports] = useState<SemesterReport[]>(reports);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedReport, setSelectedReport] = useState<SemesterReport | null>(null);
    const [activeSection, setActiveSection] = useState<string>('religious_moral');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setFilteredReports(reports);
    }, [reports]);

    const applyFilters = useCallback(() => {
        let filtered = [...reports];

        if (selectedChildId) {
            filtered = filtered.filter(report => report.child_id._id === selectedChildId);
        }
        if (selectedYear && selectedSemester) {
            const semesterString = `${selectedYear}-${selectedSemester}`;
            filtered = filtered.filter(report => report.semester === semesterString);
        } else if (selectedYear) {
            filtered = filtered.filter(report => report.semester.startsWith(selectedYear));
        } else if (selectedSemester) {
            filtered = filtered.filter(report => report.semester.endsWith(`-${selectedSemester}`));
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(report =>
                report.child_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.teacher_id.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => b.semester.localeCompare(a.semester));

        setFilteredReports(filtered);
        setCurrentPage(1);

    }, [reports, selectedChildId, selectedYear, selectedSemester, searchQuery]); 

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const clearFilters = () => {
        setSelectedChildId('');
        setSelectedSemester('');
        setSelectedYear('');
        setSearchQuery('');
    };

    const availableYears = Array.from(
        new Set(reports.map(r => r.semester.split('-')[0]))
    ).sort((a, b) => parseInt(b) - parseInt(a));

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    const hasActiveFilters = selectedChildId || selectedSemester || selectedYear || searchQuery.trim();

    const parseSemester = (semester: string): string => {
        const [year, sem] = semester.split('-');
        return `Semester ${sem} - ${year}`;
    };

    const viewReportDetails = (report: SemesterReport) => {
        setSelectedReport(report);
        setActiveSection('religious_moral');
    };

    const closeReportDetails = () => {
        setSelectedReport(null);
    };

    const sectionMeta = [
        { id: 'religious_moral', title: 'Nilai Agama & Moral', icon: FiStar, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
        { id: 'social_emotional', title: 'Sosial Emosional', icon: FiHeart, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
        { id: 'cognitive', title: 'Kognitif', icon: FiCpu, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
        { id: 'language', title: 'Bahasa', icon: FiMessageCircle, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
        { id: 'gross_motor', title: 'Motorik Kasar', icon: FiActivity, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
        { id: 'fine_motor', title: 'Motorik Halus', icon: FiEdit2, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
        { id: 'independence', title: 'Kemandirian', icon: FiShield, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
        { id: 'art', title: 'Seni', icon: FiPenTool, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
        { id: 'teacher_notes', title: 'Catatan Guru', icon: FiFileText, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    ] as const;

    const formatChecklistItemName = (key: string) =>
        key
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    const statusChip = (value?: string) => {
        switch (value) {
            case 'Konsisten':
                return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Konsisten</span>;
            case 'Belum Konsisten':
                return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Belum Konsisten</span>;
            case 'Tidak Teramati':
                return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">Tidak Teramati</span>;
            case 'Mandiri':
                return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Mandiri</span>;
            case 'Bantuan Verbal':
                return <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">Bantuan Verbal</span>;
            case 'Bantuan Fisik':
                return <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">Bantuan Fisik</span>;
            default:
                return <span className="text-xs text-gray-600">{value || '-'}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat laporan semester...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiFilter className="mr-2" />
                        Filter Laporan
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                        >
                            <FiX className="h-4 w-4" />
                            <span>Bersihkan Filter</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Cari nama anak atau guru..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    {/* Child Filter */}
                    <div>
                        <select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        >
                            <option value="">Semua Anak</option>
                            {children.map((child) => (
                                <option key={child._id} value={child._id}>
                                    {child.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        >
                            <option value="">Semua Tahun</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester Filter */}
                    <div>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        >
                            <option value="">Semua Semester</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Menampilkan {filteredReports.length} laporan semester
            </div>

            {/* Reports Grid */}
            {currentItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        {hasActiveFilters ? 'Tidak ada laporan yang sesuai dengan filter' : 'Belum ada laporan semester'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {currentItems.map((report) => (
                        <div key={report._id} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="font-semibold text-brand-purple">{report.child_id.name}</h3>
                                <p className="text-sm text-gray-600">{parseSemester(report.semester)}</p>
                                <p className="text-xs text-gray-500 mt-1">Guru: {report.teacher_id.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => viewReportDetails(report)}
                                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                                >
                                    Lihat
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Halaman {currentPage} dari {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sebelumnya
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                            currentPage === pageNum
                                                ? 'bg-brand-purple text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-rammetto text-brand-purple">
                                    Laporan Semester - {selectedReport.child_id.name}
                                </h2>
                                <p className="text-gray-600">{parseSemester(selectedReport.semester)}</p>
                                <p className="text-xs text-gray-500 mt-1">Guru: {selectedReport.teacher_id.name}</p>
                            </div>
                            <button onClick={closeReportDetails} className="text-gray-500 hover:text-gray-700">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Card Grid matching Teacher view */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {sectionMeta.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            type="button"
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center space-x-4 rounded-lg p-4 text-left transition-all hover:shadow-lg ${isActive ? 'shadow-lg scale-105 border-2 border-login-pink' : 'shadow-sm'} ${section.bgColor}`}
                                        >
                                            <div className={`rounded-full p-3 ${section.iconColor} bg-white`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-brand-purple">{section.title}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Detail Section (read-only) */}
                            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                                {sectionMeta.map((section) => {
                                    const isActive = activeSection === section.id;
                                    if (!isActive) return null;

                                    if (section.id === 'teacher_notes') {
                                        const notes = (selectedReport as any).teacher_notes;
                                        return (
                                            <div key={section.id}>
                                                <h3 className="text-xl font-bold text-brand-purple border-b border-gray-200 pb-3 mb-4">Catatan Akhir Guru</h3>
                                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                                    <p className="text-sm text-gray-600 italic">{notes || 'Tidak ada catatan'}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const data = (selectedReport as any)[section.id] as Record<string, string> | undefined;
                                    return (
                                        <div key={section.id}>
                                            <h3 className="text-xl font-bold text-brand-purple border-b border-gray-200 pb-3 mb-4">{section.title}</h3>
                                            {data ? (
                                                <div className="divide-y divide-gray-100">
                                                    {Object.entries(data).map(([key, value]) => (
                                                        <div key={key} className="py-3 flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-800">{formatChecklistItemName(key)}</span>
                                                            {statusChip(value)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">Tidak ada data untuk kategori ini.</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

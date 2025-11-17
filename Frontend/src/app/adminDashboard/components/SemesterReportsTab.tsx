// Semester Reports Tab Component
'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiDownload, FiEye } from 'react-icons/fi';
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
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setFilteredReports(reports);
    }, [reports]);

    useEffect(() => {
        applyFilters();
    }, [selectedChildId, selectedSemester, selectedYear, searchQuery, reports]);

    const applyFilters = () => {
        let filtered = [...reports];

        // Filter by child
        if (selectedChildId) {
            filtered = filtered.filter(report => report.child_id._id === selectedChildId);
        }

        // Filter by semester and year
        if (selectedYear && selectedSemester) {
            const semesterString = `${selectedYear}-${selectedSemester}`;
            filtered = filtered.filter(report => report.semester === semesterString);
        } else if (selectedYear) {
            filtered = filtered.filter(report => report.semester.startsWith(selectedYear));
        } else if (selectedSemester) {
            filtered = filtered.filter(report => report.semester.endsWith(`-${selectedSemester}`));
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(report =>
                report.child_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.teacher_id.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort by semester (newest first)
        filtered.sort((a, b) => b.semester.localeCompare(a.semester));

        setFilteredReports(filtered);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedChildId('');
        setSelectedSemester('');
        setSelectedYear('');
        setSearchQuery('');
    };

    // Get unique years from reports
    const availableYears = Array.from(
        new Set(reports.map(r => r.semester.split('-')[0]))
    ).sort((a, b) => parseInt(b) - parseInt(a));

    // Pagination
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
    };

    const closeReportDetails = () => {
        setSelectedReport(null);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((report) => (
                        <div key={report._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                {/* Header */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-brand-purple">
                                        {report.child_id.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{parseSemester(report.semester)}</p>
                                </div>

                                {/* Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium">Guru:</span>
                                        <span className="ml-2">{report.teacher_id.name}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium">Jenis Kelamin:</span>
                                        <span className="ml-2">{report.child_id.gender}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2 pt-4 border-t">
                                    <button
                                        onClick={() => viewReportDetails(report)}
                                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                    >
                                        <FiEye className="h-4 w-4" />
                                        <span>Lihat Detail</span>
                                    </button>
                                </div>
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
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-purple">
                                    Laporan Semester - {selectedReport.child_id.name}
                                </h2>
                                <p className="text-gray-600">{parseSemester(selectedReport.semester)}</p>
                            </div>
                            <button
                                onClick={closeReportDetails}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Guru: <span className="font-medium">{selectedReport.teacher_id.name}</span>
                            </p>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    <strong>Catatan:</strong> Detail lengkap laporan semester berisi penilaian komprehensif 
                                    terhadap berbagai aspek perkembangan anak. Untuk melihat detail lengkap setiap kategori 
                                    penilaian, silakan gunakan fitur lihat detail atau download PDF.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {selectedReport.religious_moral && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Nilai Agama dan Moral</h3>
                                        <p className="text-sm text-gray-600">Aspek penilaian mencakup kegiatan berdoa, sikap, dan pengenalan ajaran agama</p>
                                    </div>
                                )}
                                
                                {selectedReport.social_emotional && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Sosial-Emosi</h3>
                                        <p className="text-sm text-gray-600">Penilaian interaksi sosial, emosi, dan kepribadian anak</p>
                                    </div>
                                )}
                                
                                {selectedReport.cognitive && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Kognitif</h3>
                                        <p className="text-sm text-gray-600">Kemampuan berpikir, memecahkan masalah, dan pengetahuan umum</p>
                                    </div>
                                )}
                                
                                {selectedReport.language && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Bahasa</h3>
                                        <p className="text-sm text-gray-600">Kemampuan komunikasi verbal dan pemahaman bahasa</p>
                                    </div>
                                )}
                                
                                {selectedReport.gross_motor && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Motorik Kasar</h3>
                                        <p className="text-sm text-gray-600">Perkembangan gerakan tubuh besar seperti berlari, melompat, dll</p>
                                    </div>
                                )}
                                
                                {selectedReport.fine_motor && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Motorik Halus</h3>
                                        <p className="text-sm text-gray-600">Koordinasi gerakan tangan dan jari untuk aktivitas detail</p>
                                    </div>
                                )}
                                
                                {selectedReport.independence && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Kemandirian</h3>
                                        <p className="text-sm text-gray-600">Kemampuan melakukan aktivitas sehari-hari secara mandiri</p>
                                    </div>
                                )}
                                
                                {selectedReport.art && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Seni</h3>
                                        <p className="text-sm text-gray-600">Ekspresi kreatif melalui musik, tari, dan seni visual</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

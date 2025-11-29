// Daily Reports Tab Component
'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiFilter, FiX } from 'react-icons/fi';
import { DailyReport } from '../types/report.types';
import { Child } from '../types/child.types';

interface DailyReportsTabProps {
    reports: DailyReport[];
    children: Child[];
    isLoading: boolean;
}

export default function DailyReportsTab({ reports, children, isLoading }: DailyReportsTabProps) {
    const [filteredReports, setFilteredReports] = useState<DailyReport[]>(reports);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setFilteredReports(reports);
    }, [reports]);

    useEffect(() => {
        let filtered = [...reports];

        // Filter by child
        if (selectedChildId) {
            filtered = filtered.filter(report => report.child_id._id === selectedChildId);
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter(report => new Date(report.date) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(report => new Date(report.date) <= new Date(endDate));
        }

        // Filter by search query (child name or teacher name)
        if (searchQuery.trim()) {
            filtered = filtered.filter(report =>
                report.child_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.teacher_id.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setFilteredReports(filtered);
        // Reset ke halaman 1 setiap kali filter berubah
        setCurrentPage(1);

    }, [reports, selectedChildId, startDate, endDate, searchQuery]); // Dependency array jadi jelas & aman

    const clearFilters = () => {
        setSelectedChildId('');
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    const hasActiveFilters = selectedChildId || startDate || endDate || searchQuery.trim();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat laporan harian...</p>
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

                    {/* Start Date */}
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Dari Tanggal"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    {/* End Date */}
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Sampai Tanggal"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Menampilkan {filteredReports.length} laporan harian
            </div>

            {/* Reports List */}
            {currentItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        {hasActiveFilters ? 'Tidak ada laporan yang sesuai dengan filter' : 'Belum ada laporan harian'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {currentItems.map((report) => (
                        <div key={report._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-brand-purple">
                                            {report.child_id.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{formatDate(report.date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700">
                                            Guru: {report.teacher_id.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Theme */}
                                    {report.theme && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Tema</p>
                                            <p className="text-sm text-gray-600">{report.theme}</p>
                                            {report.sub_theme && (
                                                <p className="text-xs text-gray-500">Sub-tema: {report.sub_theme}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Physical Motor */}
                                    {report.physical_motor && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Fisik Motorik</p>
                                            <p className="text-sm text-gray-600">{report.physical_motor}</p>
                                        </div>
                                    )}

                                    {/* Cognitive */}
                                    {report.cognitive && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Kognitif</p>
                                            <p className="text-sm text-gray-600">{report.cognitive}</p>
                                        </div>
                                    )}

                                    {/* Social Emotional */}
                                    {report.social_emotional && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Sosial Emosional</p>
                                            <p className="text-sm text-gray-600">{report.social_emotional}</p>
                                        </div>
                                    )}

                                    {/* Meals */}
                                    {report.meals && (report.meals.snack || report.meals.lunch) && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Makanan</p>
                                            {report.meals.snack && (
                                                <p className="text-sm text-gray-600">Snack: {report.meals.snack}</p>
                                            )}
                                            {report.meals.lunch && (
                                                <p className="text-sm text-gray-600">Makan Siang: {report.meals.lunch}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Nap Duration */}
                                    {report.nap_duration && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Durasi Tidur Siang</p>
                                            <p className="text-sm text-gray-600">{report.nap_duration}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Special Notes */}
                                {report.special_notes && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm font-semibold text-gray-700">Catatan Khusus</p>
                                        <p className="text-sm text-gray-600 mt-1">{report.special_notes}</p>
                                    </div>
                                )}
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
        </div>
    );
}

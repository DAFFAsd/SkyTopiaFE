'use client';

import Link from 'next/link';
import { FiArrowLeft, FiFilter, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface InventoryRequest {
    _id: string;
    itemName: string;
    requestedBy: {
        _id: string;
        name: string;
    };
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    approvedBy?: {
        _id: string;
        name: string;
    };
    approvedAt?: string;
}

interface ReportStats {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
}

export default function InventoryReportsPage() {
    const [requests, setRequests] = useState<InventoryRequest[]>([]);
    const [stats, setStats] = useState<ReportStats>({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        approvalRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReportData();
    }, [filter, dateFilter]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (dateFilter !== 'all') params.append('dateFilter', dateFilter);

            const response = await fetch(`/api/inventory/requests/report?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            setMessage({ type: 'error', text: 'Gagal mengambil data laporan' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'Menunggu';
            case 'Approved':
                return 'Disetujui';
            case 'Rejected':
                return 'Ditolak';
            default:
                return status;
        }
    };

    const filteredRequests = requests.filter(request =>
        request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand-purple">
                    Laporan Permintaan Inventaris
                </h1>
                <button
                    onClick={() => fetchReportData()}
                    className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    <FiRefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {message.text && (
                <div className={`rounded-md p-4 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiTrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Permintaan</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiCheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Disetujui</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiXCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ditolak</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiClock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tingkat Persetujuan</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <FiFilter className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="statusFilter" className="text-sm text-gray-600">Status:</label>
                        <select
                            id="statusFilter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple text-sm"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="dateFilter" className="text-sm text-gray-600">Periode:</label>
                        <select
                            id="dateFilter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple text-sm"
                        >
                            <option value="all">Semua Waktu</option>
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="search" className="text-sm text-gray-600">Cari:</label>
                        <input
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nama barang atau pengguna..."
                            className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Data Cards */}
            {isLoading ? (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <div className="text-gray-600">Memuat data laporan...</div>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="space-y-4">
                    {/* Horizontal Scroll Container */}
                    <div className="overflow-x-auto pb-4">
                        <div className="flex space-x-4 min-w-max">
                            {filteredRequests.map((request) => (
                                <div key={request._id} className="bg-white rounded-lg shadow-sm p-6 min-w-[320px] max-w-[320px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {request.itemName}
                                            </h3>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><span className="font-medium">Diminta oleh:</span> {request.requestedBy.name}</p>
                                                <p><span className="font-medium">Jumlah:</span> {request.quantity}</p>
                                                <p><span className="font-medium">Tanggal:</span> {formatDate(request.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-4 ${
                                            request.status === 'Approved'
                                                ? 'bg-green-100 text-green-800'
                                                : request.status === 'Rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {getStatusText(request.status)}
                                        </span>
                                    </div>

                                    {request.status !== 'Pending' && request.approvedBy && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className="text-sm text-gray-600">
                                                <p><span className="font-medium">Diproses oleh:</span> {request.approvedBy.name}</p>
                                                {request.approvedAt && (
                                                    <p><span className="font-medium">Tanggal proses:</span> {formatDate(request.approvedAt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            Menampilkan {filteredRequests.length} dari {requests.length} permintaan inventaris
                            {filter !== 'all' && ` dengan status ${getStatusText(filter)}`}
                            {dateFilter !== 'all' && ` dalam periode ${dateFilter}`}
                            {searchTerm && ` yang cocok dengan "${searchTerm}"`}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <div className="text-gray-600">
                        Tidak ada data permintaan inventaris {filter !== 'all' ? `dengan status ${getStatusText(filter)}` : ''} {dateFilter !== 'all' ? `dalam periode ${dateFilter}` : ''}
                    </div>
                </div>
            )}
        </div>
    );
}
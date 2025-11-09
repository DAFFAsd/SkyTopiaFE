"use client";

import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';
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

export default function RequestsPage() {
    const [requests, setRequests] = useState<InventoryRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [period, setPeriod] = useState<'all' | '30' | '90'>('all');
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/inventory-requests${filter !== 'all' ? `?status=${filter}` : ''}`);
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setMessage({ type: 'error', text: 'Gagal mengambil data permintaan' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (requestId: string, status: 'Approved' | 'Rejected') => {
        try {
            setIsProcessing(requestId);
            setMessage({ type: '', text: '' });

            const response = await fetch(`/api/inventory-requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Permintaan berhasil ${status === 'Approved' ? 'disetujui' : 'ditolak'}`
                });
                fetchRequests();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat memproses permintaan' });
        } finally {
            setIsProcessing(null);
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

    return (
        <div className="space-y-6">
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand-purple">
                    Persetujuan Permintaan Inventaris
                </h1>
                <button
                    onClick={() => fetchRequests()}
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

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="text-sm text-gray-500">Total Permintaan</div>
                    <div className="text-2xl font-bold text-brand-purple">{requests.length}</div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="text-sm text-gray-500">Disetujui</div>
                    <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'Approved').length}</div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="text-sm text-gray-500">Ditolak</div>
                    <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === 'Rejected').length}</div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="text-sm text-gray-500">Tingkat Persetujuan</div>
                    <div className="text-2xl font-bold text-yellow-600">{
                        requests.length === 0 ? '0%' : `${Math.round((requests.filter(r => r.status === 'Approved').length / requests.length) * 100)}%`
                    }</div>
                </div>
            </div>

            {/* Filters: status (server), period (client), search */}
            <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FiFilter className="h-5 w-5 text-gray-400" />
                            <label htmlFor="filter" className="text-sm font-medium text-gray-700">Filter: </label>
                        </div>
                        <select
                            id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>

                        <label className="text-sm text-gray-500">Periode:</label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as any)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                        >
                            <option value="all">Semua Waktu</option>
                            <option value="30">30 Hari Terakhir</option>
                            <option value="90">90 Hari Terakhir</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Cari nama barang atau pengaju"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                        />
                        <button onClick={() => fetchRequests()} className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Terapkan</button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <FiFilter className="h-5 w-5 text-gray-400" />
                    <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                        Filter Status:
                    </label>
                </div>
                <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                </select>
            </div>

            {isLoading ? (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <div className="text-gray-600">Memuat data...</div>
                </div>
            ) : requests.length > 0 ? (
                <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama Barang</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Diminta Oleh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Jumlah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {request.itemName}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {request.requestedBy.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {request.quantity}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {formatDate(request.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(request.status)}`}>
                                            {getStatusText(request.status)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        {request.status === 'Pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApproval(request._id, 'Approved')}
                                                    disabled={isProcessing === request._id}
                                                    className="rounded p-1 text-green-600 hover:bg-green-100"
                                                >
                                                    <FiCheck className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(request._id, 'Rejected')}
                                                    disabled={isProcessing === request._id}
                                                    className="rounded p-1 text-red-600 hover:bg-red-100"
                                                >
                                                    <FiX className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                        {request.status !== 'Pending' && request.approvedBy && (
                                            <div className="text-xs text-gray-500">
                                                {request.status === 'Approved' ? 'Disetujui' : 'Ditolak'} oleh: {request.approvedBy.name}
                                                <br />
                                                {request.approvedAt && formatDate(request.approvedAt)}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <div className="text-gray-600">
                        Tidak ada permintaan inventaris {filter !== 'all' ? `dengan status ${getStatusText(filter)}` : ''}
                    </div>
                </div>
            )}
        </div>
    );
}
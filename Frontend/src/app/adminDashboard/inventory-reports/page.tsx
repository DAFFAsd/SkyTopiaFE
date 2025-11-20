'use client';

import Link from 'next/link';
import { FiArrowLeft, FiFilter, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface InventoryItem {
    _id: string;
    name: string;
    description: string;
    quantity: number;
    facility?: { _id: string; name: string };
}

interface InventoryRequest {
    _id: string;
    itemName: string;
    requestedBy: { _id: string; name: string };
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    approvedBy?: { _id: string; name: string };
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
    const [activeTab, setActiveTab] = useState<'requests' | 'items'>('requests');
    const [requests, setRequests] = useState<InventoryRequest[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<ReportStats>({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        approvalRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [requestSearchTerm, setRequestSearchTerm] = useState('');
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [itemFormData, setItemFormData] = useState({
        name: '',
        description: '',
        quantity: 0
    });

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchReportData();
        } else {
            fetchItems();
        }
    }, [activeTab, filter, dateFilter, requestSearchTerm]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (dateFilter !== 'all') params.append('dateFilter', dateFilter);
            if (requestSearchTerm) params.append('search', requestSearchTerm);

            const response = await fetch(`/api/inventory/requests?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            
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

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/inventory/items', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            
            const data = await response.json();
            if (data.success) setItems(data.items);
        } catch (error) {
            console.error('Error fetching items:', error);
            setMessage({ type: 'error', text: 'Gagal mengambil data barang' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = () => {
        setEditingItemId(null);
        setItemFormData({ name: '', description: '', quantity: 0 });
        setShowItemForm(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItemId(item._id);
        setItemFormData({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity
        });
        setShowItemForm(true);
    };

    const handleSubmitItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemFormData.name.trim()) {
            setMessage({ type: 'error', text: 'Nama barang tidak boleh kosong' });
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const url = editingItemId ? `/api/inventory/items/${editingItemId}` : '/api/inventory/items';
            const method = editingItemId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(itemFormData)
            });

            const data = await response.json();
            if (data.success) {
                setMessage({
                    type: 'success',
                    text: editingItemId ? 'Barang berhasil diperbarui!' : 'Barang berhasil ditambahkan!'
                });
                setShowItemForm(false);
                setItemFormData({ name: '', description: '', quantity: 0 });
                fetchItems();
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menyimpan barang' });
            }
        } catch (error) {
            console.error('Error submitting item:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan barang' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Yakin ingin menghapus barang ini?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/inventory/items/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Barang berhasil dihapus!' });
                fetchItems();
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menghapus barang' });
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus barang' });
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/inventory/requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Permintaan disetujui!' });
                fetchReportData();
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menyetujui permintaan' });
            }
        } catch (error) {
            console.error('Error approving request:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyetujui permintaan' });
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/inventory/requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Rejected' })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Permintaan ditolak!' });
                fetchReportData();
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menolak permintaan' });
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menolak permintaan' });
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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'Menunggu';
            case 'Approved': return 'Disetujui';
            case 'Rejected': return 'Ditolak';
            default: return status;
        }
    };

    // Data dari backend sudah di-filter, jadi langsung pakai requests
    const displayRequests = requests;

    return (
        <div className="space-y-6">
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand-purple">
                    Manajemen Inventaris
                </h1>
                <button
                    onClick={() => activeTab === 'requests' ? fetchReportData() : fetchItems()}
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

            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'requests'
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Permintaan ({stats.total})
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'items'
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Daftar Barang ({items.length})
                </button>
            </div>

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <FiTrendingUp className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Permintaan</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <FiCheckCircle className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <FiXCircle className="h-8 w-8 text-red-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <FiClock className="h-8 w-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tingkat Persetujuan</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="space-y-4">
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
                                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
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
                                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                                    >
                                        <option value="all">Semua Waktu</option>
                                        <option value="today">Hari Ini</option>
                                        <option value="week">Minggu Ini</option>
                                        <option value="month">Bulan Ini</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama barang atau nama guru..."
                                    value={requestSearchTerm}
                                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requests Table */}
                    {isLoading ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-600">Memuat data laporan...</p>
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Barang</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Diminta Oleh</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Jumlah</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayRequests.map((request) => (
                                            <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900 font-medium">{request.itemName}</td>
                                                <td className="py-3 px-4 text-gray-600">{request.requestedBy.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{request.quantity}</td>
                                                <td className="py-3 px-4 text-sm text-gray-500">{formatDate(request.createdAt)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        request.status === 'Approved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : request.status === 'Rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {getStatusText(request.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {request.status === 'Pending' && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleApproveRequest(request._id)}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(request._id)}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-600">Tidak ada data permintaan inventaris</p>
                        </div>
                    )}
                </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
                <div className="space-y-6">
                    <button
                        onClick={handleAddItem}
                        className="flex items-center space-x-2 rounded-md bg-brand-purple px-4 py-2 text-white font-medium hover:bg-purple-700"
                    >
                        <FiPlus className="h-5 w-5" />
                        <span>Tambah Barang</span>
                    </button>

                    {/* Item Form Modal */}
                    {showItemForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        {editingItemId ? 'Edit Barang' : 'Tambah Barang Baru'}
                                    </h3>
                                    <button
                                        onClick={() => setShowItemForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitItem} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Barang
                                        </label>
                                        <input
                                            type="text"
                                            value={itemFormData.name}
                                            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi (Opsional)
                                        </label>
                                        <textarea
                                            value={itemFormData.description}
                                            onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stok
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemFormData.quantity}
                                            onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        />
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-2 bg-brand-purple text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowItemForm(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Items Grid */}
                    {isLoading ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-600">Memuat data barang...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <div key={item._id} className="bg-white rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                    )}
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Stok:</span> {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="flex-1 px-3 py-2 flex items-center justify-center space-x-1 text-sm font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                                        >
                                            <FiEdit2 className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="flex-1 px-3 py-2 flex items-center justify-center space-x-1 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-600 mb-4">Tidak ada barang yang tersedia</p>
                            <button
                                onClick={handleAddItem}
                                className="inline-flex items-center space-x-2 rounded-md bg-brand-purple px-4 py-2 text-white font-medium hover:bg-purple-700"
                            >
                                <FiPlus className="h-5 w-5" />
                                <span>Tambah Barang Pertama</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

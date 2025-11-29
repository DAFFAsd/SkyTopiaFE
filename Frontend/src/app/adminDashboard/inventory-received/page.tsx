'use client';

import Link from 'next/link';
import { FiArrowLeft, FiFilter, FiRefreshCw, FiCheck, FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';

interface ReceivedItem {
    _id: string;
    itemName: string;
    quantityRequested: number;
    quantityReceived: number;
    requestId: string;
    receivedDate: string;
    notes?: string;
    receivedBy: {
        _id: string;
        name: string;
    };
}

export default function InventoryReceivedReportPage() {
    const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        quantityRequested: 0,
        quantityReceived: 0,
        notes: ''
    });

    // 1. Bungkus fetchData dengan useCallback
    // Ini bikin fungsinya bisa "hidup" di luar useEffect tapi tetap aman
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali');
                return;
            }

            const params = new URLSearchParams();
            if (dateFilter !== 'all') params.append('dateFilter', dateFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/inventory/received?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setReceivedItems(data.received || []);
            } else {
                setError(data.message || 'Gagal memuat data barang diterima');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, [dateFilter, searchTerm]); // Dependency array pindah ke sini

    // 2. useEffect tinggal panggil fungsi itu
    useEffect(() => {
        fetchData();
    }, [fetchData]); // Dependency-nya sekarang adalah fungsinya sendiri
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.itemName.trim()) {
            setError('Nama barang harus diisi');
            return;
        }
        
        if (formData.quantityReceived <= 0) {
            setError('Jumlah diterima harus lebih dari 0');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/inventory/received', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Barang diterima berhasil ditambahkan');
                setShowForm(false);
                setFormData({
                    itemName: '',
                    quantityRequested: 0,
                    quantityReceived: 0,
                    notes: ''
                });
                fetchData();
            } else {
                setError(data.message || 'Gagal menambahkan barang diterima');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err instanceof Error ? err.message : 'Gagal menambahkan barang');
        } finally {
            setSubmitting(false);
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

    const displayItems = receivedItems.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.receivedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalQuantityRequested = receivedItems.reduce((sum, item) => sum + item.quantityRequested, 0);
    const totalQuantityReceived = receivedItems.reduce((sum, item) => sum + item.quantityReceived, 0);
    const completionRate = receivedItems.length > 0 ? Math.round((totalQuantityReceived / totalQuantityRequested) * 100) : 0;

    return (
        <div className="space-y-6">
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand-purple">Laporan Barang Diterima</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2 rounded-md bg-brand-purple px-4 py-2 text-sm text-white hover:bg-opacity-90"
                    >
                        <FiPlus className="h-4 w-4" />
                        <span>Tambah Barang</span>
                    </button>
                    <button
                        onClick={() => fetchData()}
                        className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <FiRefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 p-4 text-green-700">
                    {success}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Total Diminta</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalQuantityRequested}</p>
                    <p className="text-xs text-gray-500 mt-1">unit barang</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Total Diterima</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{totalQuantityReceived}</p>
                    <p className="text-xs text-gray-500 mt-1">unit barang</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Tingkat Pemenuhan</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{completionRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">dari total permintaan</p>
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
                            <label htmlFor="dateFilter" className="text-sm text-gray-600">Periode:</label>
                            <select
                                id="dateFilter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
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
                            placeholder="Cari berdasarkan nama barang atau nama penerima..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                </div>
            </div>

            {/* Received Items Table */}
            {loading ? (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            ) : displayItems.length > 0 ? (
                <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Barang</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Diminta</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Diterima</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Penerima</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Catatan</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayItems.map((item) => (
                                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-900 font-medium">{item.itemName}</td>
                                        <td className="py-3 px-4 text-gray-600">{item.quantityRequested} unit</td>
                                        <td className="py-3 px-4 text-green-600 font-semibold">{item.quantityReceived} unit</td>
                                        <td className="py-3 px-4 text-gray-600">{item.receivedBy.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{formatDate(item.receivedDate)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                            {item.notes || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded w-fit">
                                                <FiCheck className="h-4 w-4 text-green-600" />
                                                <span className="text-xs font-semibold text-green-600">Diterima</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <p className="text-gray-600">Tidak ada data barang diterima</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setError('');
                                setFormData({
                                    itemName: '',
                                    quantityRequested: 0,
                                    quantityReceived: 0,
                                    notes: ''
                                });
                            }}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <FiX className="h-5 w-5" />
                        </button>

                        <h2 className="mb-4 text-xl font-semibold text-brand-purple">Tambah Barang Diterima</h2>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Nama Barang <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none"
                                    placeholder="Contoh: Pensil 2B"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Jumlah Diminta
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantityRequested || ''}
                                    onChange={(e) => setFormData({ ...formData, quantityRequested: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Jumlah Diterima <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantityReceived || ''}
                                    onChange={(e) => setFormData({ ...formData, quantityReceived: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none"
                                    placeholder="0"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Catatan
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none"
                                    placeholder="Tambahkan catatan (opsional)"
                                    rows={3}
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError('');
                                        setFormData({
                                            itemName: '',
                                            quantityRequested: 0,
                                            quantityReceived: 0,
                                            notes: ''
                                        });
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { FiArrowLeft, FiPlus, FiLoader, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface InventoryItem {
    _id: string;
    name: string;
    description: string;
    quantity: number;
}

interface InventoryRequest {
    _id: string;
    itemName: string;
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    approvedAt?: string;
}

interface FacilityRequest {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    createdAt: string;
    approvedAt?: string;
}

export default function ResourceRequestsPage() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'facility'>('inventory');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [inventoryRequests, setInventoryRequests] = useState<InventoryRequest[]>([]);
    const [facilityRequests, setFacilityRequests] = useState<FacilityRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Inventory form data
    const [inventoryFormData, setInventoryFormData] = useState({ itemName: '', quantity: 1 });

    // Facility form data
    const [facilityFormData, setFacilityFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium' as 'Low' | 'Medium' | 'High'
    });

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventoryData();
        } else {
            fetchFacilityData();
        }
    }, [activeTab]);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali');
                return;
            }

            // Fetch available items
            const itemsRes = await fetch('/api/inventory/items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const itemsData = await itemsRes.json();
            if (itemsData.success) {
                setItems(itemsData.items || []);
            }

            // Fetch my inventory requests
            const requestsRes = await fetch('/api/inventory/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsRes.json();
            if (requestsData.success) {
                setInventoryRequests(requestsData.requests || []);
            }

            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const fetchFacilityData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali');
                return;
            }

            // Fetch my facility requests
            const requestsRes = await fetch('/api/facility-requests/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsRes.json();
            if (requestsData.success) {
                setFacilityRequests(requestsData.requests || []);
            }

            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleInventorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inventoryFormData.itemName || inventoryFormData.quantity < 1) {
            setError('Silakan isi semua field dengan benar');
            return;
        }

        const item = items.find(i => i.name === inventoryFormData.itemName);
        if (!item) {
            setError('Barang tidak ditemukan');
            return;
        }

        if (inventoryFormData.quantity > item.quantity) {
            setError(`Stok tidak cukup. Stok tersedia: ${item.quantity}`);
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const token = localStorage.getItem('token');

            const res = await fetch('/api/inventory/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(inventoryFormData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Permintaan inventaris berhasil dibuat!');
                setInventoryFormData({ itemName: '', quantity: 1 });
                setSelectedItem(null);
                setShowForm(false);
                setTimeout(() => setSuccess(''), 3000);
                fetchInventoryData();
            } else {
                setError(data.message || 'Gagal membuat permintaan');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFacilitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!facilityFormData.title || !facilityFormData.description) {
            setError('Silakan isi semua field dengan benar');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const token = localStorage.getItem('token');

            const res = await fetch('/api/facility-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facilityFormData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Laporan fasilitas berhasil dibuat!');
                setFacilityFormData({ title: '', description: '', priority: 'Medium' });
                setShowForm(false);
                setTimeout(() => setSuccess(''), 3000);
                fetchFacilityData();
            } else {
                setError(data.message || 'Gagal membuat laporan');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority) {
            case 'Low':
                return 'bg-blue-100 text-blue-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'High':
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
            case 'Completed':
                return 'Selesai';
            default:
                return status;
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

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-brand-purple">Permintaan & Laporan</h1>
                <div className="flex justify-center items-center py-12">
                    <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <div className="flex items-center justify-between">
                <PageHeader title="Permintaan & Laporan" description="Ajukan permintaan barang atau laporkan fasilitas" />
                <button
                    onClick={() => activeTab === 'inventory' ? fetchInventoryData() : fetchFacilityData()}
                    className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    <FiRefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700 flex items-center space-x-2">
                    <FiAlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 p-4 text-green-700">
                    {success}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'inventory'
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Permintaan Inventaris ({inventoryRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('facility')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'facility'
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Laporan Fasilitas ({facilityRequests.length})
                </button>
            </div>

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center space-x-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                        >
                            <FiPlus className="h-4 w-4" />
                            <span>Buat Permintaan Baru</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-brand-purple mb-4">Buat Permintaan Inventaris</h2>
                            <form onSubmit={handleInventorySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Barang
                                    </label>
                                    <select
                                        value={inventoryFormData.itemName}
                                        onChange={(e) => {
                                            const itemName = e.target.value;
                                            setInventoryFormData({ ...inventoryFormData, itemName });
                                            const item = items.find(i => i.name === itemName);
                                            setSelectedItem(item || null);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {items.map((item) => (
                                            <option key={item._id} value={item.name}>
                                                {item.name} (Tersedia: {item.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedItem && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Stok tersedia: {selectedItem.quantity} unit
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedItem?.quantity || 999}
                                        value={inventoryFormData.quantity}
                                        onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
                                    {selectedItem && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maksimal: {selectedItem.quantity} unit
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <FiLoader className="animate-spin h-4 w-4 inline mr-2" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            'Kirim Permintaan'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setSelectedItem(null);
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Inventory Requests List */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Permintaan Saya</h2>
                        {inventoryRequests.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                                Tidak ada permintaan inventaris
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {inventoryRequests.map((request) => (
                                    <div key={request._id} className="bg-white rounded-lg shadow-sm p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {request.itemName}
                                                </h3>
                                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium">Jumlah:</span> {request.quantity}</p>
                                                    <p><span className="font-medium">Tanggal Permintaan:</span> {formatDate(request.createdAt)}</p>
                                                    {request.approvedAt && (
                                                        <p><span className="font-medium">Tanggal Disetujui:</span> {formatDate(request.approvedAt)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ml-4 ${getStatusBadgeColor(request.status)}`}>
                                                {getStatusText(request.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Facility Tab */}
            {activeTab === 'facility' && (
                <div className="space-y-6">
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center space-x-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                        >
                            <FiPlus className="h-4 w-4" />
                            <span>Buat Laporan Fasilitas</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-brand-purple mb-4">Buat Laporan Fasilitas</h2>
                            <form onSubmit={handleFacilitySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        value={facilityFormData.title}
                                        onChange={(e) => setFacilityFormData({ ...facilityFormData, title: e.target.value })}
                                        placeholder="Contoh: Atap Ruang Kelas Bocor"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={facilityFormData.description}
                                        onChange={(e) => setFacilityFormData({ ...facilityFormData, description: e.target.value })}
                                        placeholder="Jelaskan detail masalah fasilitas..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioritas
                                    </label>
                                    <select
                                        value={facilityFormData.priority}
                                        onChange={(e) => setFacilityFormData({ ...facilityFormData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    >
                                        <option value="Low">Rendah</option>
                                        <option value="Medium">Sedang</option>
                                        <option value="High">Tinggi</option>
                                    </select>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <FiLoader className="animate-spin h-4 w-4 inline mr-2" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            'Kirim Laporan'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Facility Requests List */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Laporan Saya</h2>
                        {facilityRequests.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                                Tidak ada laporan fasilitas
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {facilityRequests.map((request) => (
                                    <div key={request._id} className="bg-white rounded-lg shadow-sm p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {request.title}
                                                </h3>
                                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                    <p>{request.description}</p>
                                                    <p><span className="font-medium">Tanggal Laporan:</span> {formatDate(request.createdAt)}</p>
                                                    {request.approvedAt && (
                                                        <p><span className="font-medium">Tanggal Disetujui:</span> {formatDate(request.approvedAt)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                                    {getStatusText(request.status)}
                                                </span>
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

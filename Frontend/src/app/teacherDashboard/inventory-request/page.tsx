'use client';

import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiLoader } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface InventoryItem {
    _id: string;
    name: string;
    description: string;
    quantity: number;
}

interface MyRequest {
    _id: string;
    itemName: string;
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    approvedAt?: string;
}

export default function InventoryRequestPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ itemName: '', quantity: 1 });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali');
                setLoading(false);
                return;
            }

            // Fetch available items
            const itemsRes = await fetch('/api/inventory/items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const itemsData = await itemsRes.json();
            console.log('Items Response:', itemsData);
            if (itemsData.success) {
                setItems(itemsData.items || []);
            } else {
                setError(itemsData.message || 'Gagal memuat daftar barang');
            }

            // Fetch my requests
            const requestsRes = await fetch('/api/inventory/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsRes.json();
            console.log('My Requests Response:', requestsData);
            if (requestsData.success) {
                setMyRequests(requestsData.requests || []);
            } else {
                setError(requestsData.message || 'Gagal memuat permintaan Anda');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.itemName || formData.quantity < 1) {
            setError('Silakan isi semua field dengan benar');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const token = localStorage.getItem('token');

            console.log('Submitting:', formData);

            const res = await fetch('/api/inventory/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            console.log('Submit Response:', data);
            
            if (data.success) {
                setSuccess('Permintaan inventaris berhasil dibuat!');
                setFormData({ itemName: '', quantity: 1 });
                setShowForm(false);
                setTimeout(() => setSuccess(''), 3000);
                fetchData();
            } else {
                setError(data.message || 'Gagal membuat permintaan');
            }
        } catch (err: any) {
            console.error('Error:', err);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <h1 className="text-3xl font-bold text-brand-purple">Permintaan Inventaris</h1>

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

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
                </div>
            ) : (
                <>
                    {/* Form Permintaan */}
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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Barang
                                    </label>
                                    <select
                                        value={formData.itemName}
                                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {items.map((item) => (
                                            <option key={item._id} value={item.name}>
                                                {item.name} (Tersedia: {item.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
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
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Daftar Permintaan Saya */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Permintaan Saya</h2>
                        {myRequests.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                                Tidak ada permintaan inventaris
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myRequests.map((request) => (
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
                </>
            )}
        </div>
    );
}
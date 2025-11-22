'use client';

import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiLoader, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface InventoryRequest {
    _id: string;
    itemName: string;
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    approvedAt?: string;
}

interface ReceivedItem {
    _id: string;
    itemName: string;
    quantityRequested: number;
    quantityReceived: number;
    requestId: string;
    receivedDate: string;
    notes?: string;
    receivedBy: {
        name: string;
    };
}

export default function InventoryReceivedPage() {
    const [approvedRequests, setApprovedRequests] = useState<InventoryRequest[]>([]);
    const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        requestId: '',
        quantityReceived: 0,
        notes: ''
    });
    const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);

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

            // Fetch approved requests
            const requestsRes = await fetch('/api/inventory/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsRes.json();

            if (requestsData.success) {
                // Filter hanya yang approved
                const approved = requestsData.requests.filter(
                    (req: InventoryRequest) => req.status === 'Approved'
                );
                setApprovedRequests(approved);
            } else {
                setError(requestsData.message || 'Gagal memuat data permintaan');
            }

            // Fetch received items
            const receivedRes = await fetch('/api/inventory/received', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const receivedData = await receivedRes.json();

            if (receivedData.success) {
                setReceivedItems(receivedData.received || []);
            } else {
                // Endpoint mungkin belum ada, jadi jangan set error
                setReceivedItems([]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRequest = (request: InventoryRequest) => {
        setSelectedRequest(request);
        setFormData({
            requestId: request._id,
            quantityReceived: request.quantity,
            notes: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.requestId || formData.quantityReceived < 1) {
            setError('Silakan isi semua field dengan benar');
            return;
        }

        if (selectedRequest && formData.quantityReceived > selectedRequest.quantity) {
            setError(`Jumlah yang diterima tidak boleh melebihi ${selectedRequest.quantity}`);
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const token = localStorage.getItem('token');

            const res = await fetch('/api/inventory/received', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestId: formData.requestId,
                    quantityReceived: formData.quantityReceived,
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Barang berhasil dicatat sebagai diterima!');
                setFormData({
                    requestId: '',
                    quantityReceived: 0,
                    notes: ''
                });
                setSelectedRequest(null);
                setShowForm(false);
                setTimeout(() => setSuccess(''), 3000);
                fetchData();
            } else {
                setError(data.message || 'Gagal mencatat barang diterima');
            }
        } catch (err) {
            console.error('Error:', err);
            setError((err as Error).message || 'Terjadi kesalahan');
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

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <h1 className="text-3xl font-bold text-brand-purple">Barang Diterima</h1>

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
                    {/* Form Input */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center space-x-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                        >
                            <FiPlus className="h-4 w-4" />
                            <span>Catat Barang Diterima</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-brand-purple mb-4">Input Barang Diterima</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Permintaan yang Disetujui
                                    </label>
                                    <select
                                        value={formData.requestId}
                                        onChange={(e) => {
                                            const requestId = e.target.value;
                                            const request = approvedRequests.find(r => r._id === requestId);
                                            handleSelectRequest(request!);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    >
                                        <option value="">-- Pilih Permintaan --</option>
                                        {approvedRequests.map((request) => (
                                            <option key={request._id} value={request._id}>
                                                {request.itemName} - {request.quantity} unit (Disetujui: {formatDate(request.approvedAt || request.createdAt)})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedRequest && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Permintaan: {selectedRequest.itemName} - {selectedRequest.quantity} unit
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah yang Diterima
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedRequest?.quantity || 999}
                                        value={formData.quantityReceived}
                                        onChange={(e) => setFormData({ ...formData, quantityReceived: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
                                    {selectedRequest && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maksimal: {selectedRequest.quantity} unit
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Contoh: Barang dalam kondisi baik, semua sesuai pesanan"
                                        rows={3}
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
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="inline mr-2 h-4 w-4" />
                                                Catat Penerimaan
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setSelectedRequest(null);
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Daftar Barang Diterima */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Barang yang Telah Diterima</h2>
                        {receivedItems.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                                Belum ada barang yang dicatat sebagai diterima
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {receivedItems.map((item) => (
                                    <div key={item._id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.itemName}
                                                </h3>
                                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium">Diminta:</span> {item.quantityRequested} unit</p>
                                                    <p><span className="font-medium">Diterima:</span> {item.quantityReceived} unit</p>
                                                    <p><span className="font-medium">Tanggal Penerimaan:</span> {formatDate(item.receivedDate)}</p>
                                                    {item.notes && (
                                                        <p><span className="font-medium">Catatan:</span> {item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                                                <FiCheck className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-semibold text-green-600">Diterima</span>
                                            </div>
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

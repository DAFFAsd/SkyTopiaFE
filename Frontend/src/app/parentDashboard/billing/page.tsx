'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiUpload } from 'react-icons/fi';

interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: string;
}

interface Payment {
    _id: string;
    child_id: Child;
    amount: number;
    due_date: string;
    paid_at?: string;
    category: 'Bulanan' | 'Semester' | 'Registrasi';
    period?: string;
    status: 'Tertunda' | 'Terkirim' | 'Dibayar' | 'Ditolak' | 'Jatuh Tempo';
    proof_of_payment_url?: string;
    rejection_reason?: string;
}

export default function BillingPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingPaymentId, setUploadingPaymentId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await fetch('http://localhost:3000/api/payments/my-payments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setPayments(data.payments);
            } else {
                setError(data.message || 'Gagal mengambil data pembayaran');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            setError('Terjadi kesalahan saat mengambil data pembayaran');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (paymentId: string, file: File) => {
        setUploadingPaymentId(paymentId);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token tidak ditemukan. Silakan login kembali.');
                return;
            }

            const formData = new FormData();
            formData.append('proof_file', file); 

            const response = await fetch(`http://localhost:3000/api/payments/${paymentId}/submit-proof`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Bukti pembayaran berhasil diunggah!');
                
                setPayments(currentPayments => 
                    currentPayments.map(p => 
                        p._id === paymentId ? data.payment : p
                    )
                );

            } else {
                alert(data.message || 'Gagal mengunggah bukti pembayaran');
            }
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Terjadi kesalahan saat mengunggah bukti pembayaran');
        } finally {
            setUploadingPaymentId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Dibayar': return <FiCheckCircle className="h-5 w-5 text-green-500" />;
            case 'Terkirim': return <FiClock className="h-5 w-5 text-yellow-500" />;
            case 'Ditolak': return <FiXCircle className="h-5 w-5 text-red-500" />;
            case 'Jatuh Tempo': return <FiAlertCircle className="h-5 w-5 text-red-500" />;
            default: return <FiClock className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dibayar': return 'bg-green-100 text-green-800';
            case 'Terkirim': return 'bg-yellow-100 text-yellow-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            case 'Jatuh Tempo': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate statistics
    const totalPending = payments.filter(p => p.status === 'Tertunda' || p.status === 'Terkirim').length;
    const totalPaid = payments.filter(p => p.status === 'Dibayar').length;
    const totalOverdue = payments.filter(p => p.status === 'Jatuh Tempo').length;
    const paidAmount = payments.filter(p => p.status === 'Dibayar').reduce((sum, p) => sum + p.amount, 0);

    return (
    <div className="space-y-6">
        <Link
            href="/parentDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <h1 className="text-3xl font-bold text-brand-purple">
            Tagihan & Pembayaran
        </h1>

        {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
            </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-yellow-50 p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Menunggu</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalPending}</p>
                    </div>
                    <FiClock className="h-8 w-8 text-yellow-500" />
                </div>
            </div>

            <div className="rounded-lg bg-green-50 p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Lunas</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalPaid}</p>
                    </div>
                    <FiCheckCircle className="h-8 w-8 text-green-500" />
                </div>
            </div>

            <div className="rounded-lg bg-red-50 p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Terlambat</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalOverdue}</p>
                    </div>
                    <FiAlertCircle className="h-8 w-8 text-red-500" />
                </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Dibayar</p>
                        <p className="text-lg font-bold text-brand-purple">{formatCurrency(paidAmount)}</p>
                    </div>
                    <FiDollarSign className="h-8 w-8 text-blue-500" />
                </div>
            </div>
        </div>

        {/* Payments List */}
        {isLoading ? (
            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                <div className="text-gray-600">Memuat data pembayaran...</div>
            </div>
        ) : payments.length > 0 ? (
            <div className="space-y-4">
                {payments.map((payment) => (
                    <div key={payment._id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                    <h3 className="text-lg font-semibold text-brand-purple">
                                        {payment.child_id.name}
                                    </h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="ml-1">{payment.status}</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Kategori</p>
                                        <p className="font-medium text-brand-purple">{payment.category}</p>
                                    </div>
                                    {payment.period && (
                                        <div>
                                            <p className="text-gray-500">Periode</p>
                                            <p className="font-medium text-brand-purple">{payment.period}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-gray-500">Jumlah</p>
                                        <p className="font-semibold text-brand-purple">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Jatuh Tempo</p>
                                        <p className="font-medium text-brand-purple">{formatDate(payment.due_date)}</p>
                                    </div>
                                </div>

                                {payment.paid_at && (
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-500">Dibayar pada: <span className="font-medium text-green-600">{formatDate(payment.paid_at)}</span></p>
                                    </div>
                                )}

                                {payment.rejection_reason && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-700">
                                            <span className="font-semibold">Alasan Penolakan: </span>
                                            {payment.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* --- INI DIA KUNCINYA --- */}
                            {/* Tambahin 'payment.status === 'Jatuh Tempo'' */}
                            {(payment.status === 'Tertunda' || payment.status === 'Ditolak' || payment.status === 'Jatuh Tempo') && (
                                <div className="ml-4 flex-shrink-0 mt-4 md:mt-0">
                                    <label
                                        htmlFor={`file-${payment._id}`}
                                        className="inline-flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg cursor-pointer hover:bg-opacity-90 transition-all"
                                    >
                                        {uploadingPaymentId === payment._id ? (
                                            <span>Mengunggah...</span>
                                        ) : (
                                            <>
                                                <FiUpload className="h-4 w-4 mr-2" />
                                                Upload Bukti
                                            </>
                                        )}
                                    </label>
                                    <input
                                        id={`file-${payment._id}`}
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleFileUpload(payment._id, file);
                                            }
                                        }}
                                        disabled={uploadingPaymentId === payment._id}
                                    />
                                </div>
                            )}

                            {payment.status === 'Terkirim' && (
                                <div className="ml-4 flex-shrink-0 mt-4 md:mt-0 px-4 py-2 bg-yellow-50 text-yellow-500 rounded-lg text-sm">
                                    Menunggu verifikasi admin
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                <p className="text-gray-600">
                    Belum ada data pembayaran.
                </p>
            </div>
        )}
    </div>
);
}

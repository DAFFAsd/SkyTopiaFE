'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiUpload, FiFilter } from 'react-icons/fi';

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

    // --- [BARU 1] State untuk Filter ---
    // Default 'ALL' artinya tampilkan semua
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL');

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
    const totalOverdue = payments.filter(p => p.status === 'Jatuh Tempo' || p.status === 'Ditolak').length; // Ditambah Ditolak biar masuk kategori merah
    const paidAmount = payments.filter(p => p.status === 'Dibayar').reduce((sum, p) => sum + p.amount, 0);

    // --- [BARU 2] Logika Filter ---
    // Kita memfilter array 'payments' berdasarkan state 'activeFilter'
    const filteredPayments = payments.filter(payment => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PENDING') return payment.status === 'Tertunda' || payment.status === 'Terkirim';
        if (activeFilter === 'PAID') return payment.status === 'Dibayar';
        if (activeFilter === 'OVERDUE') return payment.status === 'Jatuh Tempo' || payment.status === 'Ditolak';
        return true;
    });

    return (
    <div className="space-y-6">
        <Link
            href="/parentDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-brand-purple">
                Tagihan & Pembayaran
            </h1>
            
            {/* Indikator filter aktif (Optional, biar user tau) */}
            {activeFilter !== 'ALL' && (
                <button 
                    onClick={() => setActiveFilter('ALL')}
                    className="flex items-center text-sm text-gray-500 hover:text-brand-purple"
                >
                    <FiXCircle className="mr-1" /> Hapus Filter
                </button>
            )}
        </div>

        {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
            </div>
        )}

        {/* Statistics Cards - SEKARANG JADI TOMBOL FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* 1. KARTU KUNING (PENDING) */}
            <div 
                onClick={() => setActiveFilter('PENDING')}
                className={`rounded-lg p-6 border-l-4 border-yellow-500 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md
                    ${activeFilter === 'PENDING' ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'bg-yellow-50'}
                `}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Menunggu</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalPending}</p>
                    </div>
                    <FiClock className={`h-8 w-8 ${activeFilter === 'PENDING' ? 'text-yellow-600' : 'text-yellow-500'}`} />
                </div>
            </div>

            {/* 2. KARTU HIJAU (LUNAS) */}
            <div 
                onClick={() => setActiveFilter('PAID')}
                className={`rounded-lg p-6 border-l-4 border-green-500 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md
                    ${activeFilter === 'PAID' ? 'bg-green-100 ring-2 ring-green-400' : 'bg-green-50'}
                `}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Lunas</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalPaid}</p>
                    </div>
                    <FiCheckCircle className={`h-8 w-8 ${activeFilter === 'PAID' ? 'text-green-600' : 'text-green-500'}`} />
                </div>
            </div>

            {/* 3. KARTU MERAH (TERLAMBAT) */}
            <div 
                onClick={() => setActiveFilter('OVERDUE')}
                className={`rounded-lg p-6 border-l-4 border-red-500 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md
                    ${activeFilter === 'OVERDUE' ? 'bg-red-100 ring-2 ring-red-400' : 'bg-red-50'}
                `}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Terlambat / Ditolak</p>
                        <p className="text-2xl font-bold text-brand-purple">{totalOverdue}</p>
                    </div>
                    <FiAlertCircle className={`h-8 w-8 ${activeFilter === 'OVERDUE' ? 'text-red-600' : 'text-red-500'}`} />
                </div>
            </div>

            {/* 4. KARTU BIRU (RESET / SEMUA) */}
            <div 
                onClick={() => setActiveFilter('ALL')}
                className={`rounded-lg p-6 border-l-4 border-blue-500 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md
                    ${activeFilter === 'ALL' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-blue-50'}
                `}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Dibayar</p>
                        <p className="text-lg font-bold text-brand-purple">{formatCurrency(paidAmount)}</p>
                        <p className="text-xs text-gray-500 mt-1">(Klik untuk lihat semua)</p>
                    </div>
                    <FiDollarSign className={`h-8 w-8 ${activeFilter === 'ALL' ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
            </div>
        </div>

        {/* --- [BARU 3] Indikator Judul Filter --- */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md w-fit">
            <FiFilter />
            <span>Menampilkan: </span>
            <span className="font-bold text-brand-purple">
                {activeFilter === 'ALL' && 'Semua Tagihan'}
                {activeFilter === 'PENDING' && 'Tagihan Menunggu Pembayaran'}
                {activeFilter === 'PAID' && 'Tagihan Lunas'}
                {activeFilter === 'OVERDUE' && 'Tagihan Bermasalah (Terlambat/Ditolak)'}
            </span>
        </div>

        {/* Payments List - MENGGUNAKAN filteredPayments */}
        {isLoading ? (
            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                <div className="text-gray-600">Memuat data pembayaran...</div>
            </div>
        ) : filteredPayments.length > 0 ? (
            <div className="space-y-4">
                {filteredPayments.map((payment) => (
                    <div key={payment._id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 animate-fade-in">
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
                    {/* Pesan kosongnya disesuaikan dengan filter */}
                    {activeFilter === 'ALL' 
                        ? 'Belum ada data pembayaran.' 
                        : 'Tidak ada tagihan untuk kategori ini.'}
                </p>
                {activeFilter !== 'ALL' && (
                    <button onClick={() => setActiveFilter('ALL')} className="mt-2 text-brand-purple underline text-sm">
                        Tampilkan semua data
                    </button>
                )}
            </div>
        )}
    </div>
    );
}
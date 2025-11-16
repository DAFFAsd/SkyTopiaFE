'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, 
    FiXCircle, FiEye, FiCheck, FiX, FiList 
} from 'react-icons/fi';

interface Child {
    _id: string;
    name: string;
}
interface Payment {
    _id: string;
    child_id: Child | null;
    amount: number;
    due_date: string;
    paid_at?: string;
    category: 'Bulanan' | 'Semester' | 'Registrasi';
    period?: string;
    status: 'Tertunda' | 'Terkirim' | 'Dibayar' | 'Ditolak' | 'Jatuh Tempo';
    proof_of_payment_url?: string;
    rejection_reason?: string;
}

export default function AdminBillingPage() {
    const [allPayments, setAllPayments] = useState<Payment[]>([]); 
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [error, setError] = useState('');
    
    const [filterStatus, setFilterStatus] = useState('Terkirim'); 
    
    const [viewingProof, setViewingProof] = useState<string | null>(null);
    const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const paymentsListRef = useRef<HTMLDivElement>(null);
    const isInitialLoad = useRef(true);

    const fetchPayments = useCallback(async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token Admin tidak ditemukan. Silakan login kembali.');
                return;
            }
            
            const response = await fetch(`http://localhost:3000/api/payments?limit=500`, { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setAllPayments(data.payments); 
            } else {
                setError(data.message || 'Gagal mengambil data pembayaran');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            setError('Terjadi kesalahan saat mengambil data pembayaran');
        } finally {
            setIsLoading(false); 
        }
    }, []); 

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]); 

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false; 
            setFilteredPayments(allPayments.filter(p => p.status === 'Terkirim'));
            return; 
        }

        setIsFiltering(true); 
        
        setTimeout(() => {
            if (filterStatus === 'Semua') {
                setFilteredPayments(allPayments);
            } else if (filterStatus === 'Menunggu') {
                const filtered = allPayments.filter(p => p.status === 'Tertunda' || p.status === 'Terkirim');
                setFilteredPayments(filtered);
            } else if (filterStatus === 'Terlambat') {
                const filtered = allPayments.filter(p => p.status === 'Jatuh Tempo' || p.status === 'Ditolak');
                setFilteredPayments(filtered);
            } else {
                const filtered = allPayments.filter(p => p.status === filterStatus);
                setFilteredPayments(filtered);
            }
            setIsFiltering(false); 
        }, 300);
        
    }, [filterStatus, allPayments]); 


    const handleUpdateStatus = async (paymentId: string, status: 'Dibayar' | 'Ditolak', reason: string = '') => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token Admin tidak ditemukan.'); return;
            }
            const body: { status: string, rejection_reason?: string } = { status };
            if (status === 'Ditolak' && reason) {
                body.rejection_reason = reason;
            }
            const response = await fetch(`http://localhost:3000/api/payments/${paymentId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                alert(`Pembayaran berhasil di-${status.toLowerCase()}!`);
                setAllPayments(currentPayments => 
                    currentPayments.map(p => 
                        p._id === paymentId ? data.payment : p
                    )
                );
                setRejectingPayment(null);
                setRejectionReason('');
            } else {
                alert(data.message || 'Gagal mengupdate status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Terjadi kesalahan');
        } finally {
            setIsSubmitting(false);
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
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Dibayar': return <FiCheckCircle className="h-5 w-5 text-green-500" />;
            case 'Terkirim': return <FiClock className="h-5 w-5 text-yellow-500" />;
            case 'Ditolak': return <FiXCircle className="h-5 w-5 text-red-500" />;
            case 'Jatuh Tempo': return <FiAlertCircle className="h-5 w-5 text-red-500" />;
            default: return <FiClock className="h-5 w-5 text-yellow-500" />;
        }
    };
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const totalPending = allPayments.filter(p => p.status === 'Tertunda' || p.status === 'Terkirim').length;
    const totalPaid = allPayments.filter(p => p.status === 'Dibayar').length;
    const totalOverdue = allPayments.filter(p => p.status === 'Jatuh Tempo' || p.status === 'Ditolak').length;
    const totalAll = allPayments.length;

    const handleFilterClick = (status: string) => {
        setFilterStatus(status);
        paymentsListRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    return (
    <>
        <div className="space-y-6">
            <Link
                href="/adminDashboard"
                className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
            >
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>

            <h1 className="text-3xl font-bold text-brand-purple">
                Manajemen Tagihan
            </h1>

            {error && ( <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div> )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    type="button"
                    onClick={() => handleFilterClick('Menunggu')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${(filterStatus === 'Menunggu' || filterStatus === 'Terkirim' || filterStatus === 'Tertunda')
                        ? 'bg-yellow-100 border-yellow-500 shadow-lg' 
                        : 'bg-yellow-50 border-yellow-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Menunggu</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalPending}</p>
                        </div>
                        <FiClock className="h-8 w-8 text-yellow-500" />
                    </div>
                </button>
                
                <button
                    type="button"
                    onClick={() => handleFilterClick('Terlambat')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${(filterStatus === 'Terlambat' || filterStatus === 'Jatuh Tempo' || filterStatus === 'Ditolak')
                        ? 'bg-red-100 border-red-500 shadow-lg' 
                        : 'bg-red-50 border-red-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Terlambat / Ditolak</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalOverdue}</p>
                        </div>
                        <FiAlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => handleFilterClick('Dibayar')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${filterStatus === 'Dibayar' 
                        ? 'bg-green-100 border-green-500 shadow-lg' 
                        : 'bg-green-50 border-green-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Lunas</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalPaid}</p>
                        </div>
                        <FiCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </button>
                
                <button
                    type="button"
                    onClick={() => handleFilterClick('Semua')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${filterStatus === 'Semua' 
                        ? 'bg-gray-200 border-gray-500 shadow-lg' 
                        : 'bg-gray-50 border-gray-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Semua Tagihan</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalAll}</p>
                        </div>
                        <FiList className="h-8 w-8 text-gray-500" />
                    </div>
                </button>
            </div>

            <div ref={paymentsListRef} className="scroll-mt-5">
                {isLoading ? (
                    <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                        <div className="text-gray-600">Memuat data pembayaran...</div>
                    </div>
                ) : (
                    <div className={`space-y-4 ${isFiltering ? 'opacity-50 transition-opacity duration-300' : ''}`}>
                        
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <div key={payment._id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h3 className="text-lg font-semibold text-brand-purple">
                                                    {payment.child_id?.name || 'Anak Terhapus'}
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
                                            {payment.proof_of_payment_url && (
                                                <button 
                                                    onClick={() => setViewingProof(payment.proof_of_payment_url || null)}
                                                    className="mt-3 text-sm text-blue-600 hover:underline flex items-center space-x-1"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                    <span>Lihat Bukti Pembayaran</span>
                                                </button>
                                            )}
                                            {payment.rejection_reason && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                                                    <span className="font-semibold">Alasan Penolakan: </span>
                                                    {payment.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                        {payment.status === 'Terkirim' && (
                                            <div className="flex-shrink-0 flex space-x-2 mt-4 md:mt-0">
                                                <button
                                                    onClick={() => setRejectingPayment(payment)}
                                                    disabled={isSubmitting}
                                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-all text-sm font-medium disabled:bg-gray-300"
                                                >
                                                    <FiX className="h-4 w-4 mr-2" />
                                                    Tolak
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(payment._id, 'Dibayar')}
                                                    disabled={isSubmitting}
                                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-all text-sm font-medium disabled:bg-gray-300"
                                                >
                                                    <FiCheck className="h-4 w-4 mr-2" />
                                                    Setujui
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
                                <p className="text-gray-600">
                                    Tidak ada data pembayaran untuk filter {filterStatus}.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {viewingProof && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
                onClick={() => setViewingProof(null)}
            >
                <div 
                    className="relative bg-white rounded-lg shadow-2xl p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setViewingProof(null)}
                        className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-gray-700 hover:text-red-500"
                    >
                        <FiXCircle className="h-8 w-8" />
                    </button>
                    <Image 
                        src={viewingProof} 
                        alt="Bukti Pembayaran" 
                        width={600} 
                        height={800} 
                        className="max-w-lg max-h-[80vh] object-contain" 
                    />
                </div>
            </div>
        )}
        
        {rejectingPayment && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
                onClick={() => setRejectingPayment(null)}
            >
                <div 
                    className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg font-semibold text-brand-purple mb-4">
                        Tolak Pembayaran untuk {rejectingPayment.child_id?.name}
                    </h3>
                    <div className="space-y-4">
                        <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700">
                            Alasan Penolakan (Wajib diisi)
                        </label>
                        <textarea
                            id="rejection_reason"
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-login-pink focus:ring-login-pink"
                            placeholder="Contoh: Jumlah transfer tidak sesuai, bukti pembayaran tidak jelas, dll."
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setRejectingPayment(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUpdateStatus(rejectingPayment._id, 'Ditolak', rejectionReason)}
                                disabled={isSubmitting || !rejectionReason}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium disabled:bg-gray-300"
                            >
                                {isSubmitting ? 'Menolak...' : 'Tolak Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
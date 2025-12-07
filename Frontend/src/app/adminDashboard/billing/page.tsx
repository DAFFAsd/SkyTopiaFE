'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, 
    FiXCircle, FiEye, FiCheck, FiX, FiSend, 
} from 'react-icons/fi';
import { apiUrl } from '@/lib/api';

interface Child {
    _id: string;
    name: string;
    monthly_fee: number; 
    semester_fee: number; 
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

function calculateFee(children: Child[], childId: string, category: 'Bulanan' | 'Semester' | 'Registrasi'): number {
    const child = children.find(c => c._id === childId);
    if (!child) return 0;
    
    switch (category) {
        case 'Bulanan':
            return child.monthly_fee || 0;
        case 'Semester':
            return child.semester_fee || 0;
        case 'Registrasi':
            return 0; 
        default:
            return 0;
    }
}

interface CreateFormProps {
    childList: Child[];
    isLoadingChildren: boolean;
    onSuccess: () => void;
}

function CreatePaymentForm({ childList, isLoadingChildren, onSuccess }: CreateFormProps) {
    const [formData, setFormData] = useState({
        child_id: '',
        category: 'Bulanan',
        period: '',
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const selectedChild = childList.find(c => c._id === formData.child_id);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    useEffect(() => {
        let newAmount = 0;
        let newPeriod = '';

        if (formData.child_id && formData.category) {
            newAmount = calculateFee(childList, formData.child_id, formData.category as 'Bulanan' | 'Semester' | 'Registrasi');
            
            if (formData.category === 'Bulanan') {
                newPeriod = new Date().toISOString().substring(0, 7).replace('-', '-'); 
            } else if (formData.category === 'Semester') {
                const currentYear = new Date().getFullYear();
                newPeriod = formData.category === 'Semester' && new Date().getMonth() + 1 > 6 ? `${currentYear}-2` : `${currentYear}-1`;
            }
        }

        setFormData(prev => ({
            ...prev,
            amount: newAmount || prev.amount, 
            period: newPeriod || prev.period,
        }));

    }, [formData.child_id, formData.category, childList]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        if (!formData.child_id || (formData.category !== 'Registrasi' && !formData.period) || formData.amount <= 0) {
            setMessage({ type: 'error', text: 'Pastikan Anak, Jumlah, dan Periode/Kategori sudah terisi dengan benar.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await fetch(apiUrl('/payments'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `Tagihan berhasil dibuat untuk ${selectedChild?.name}.` });
                onSuccess(); 
                setFormData(prev => ({
                    ...prev,
                    category: 'Bulanan',
                    amount: calculateFee(childList, prev.child_id, 'Bulanan'),
                    period: new Date().toISOString().substring(0, 7).replace('-', '-'),
                }));
            } else {
                throw new Error(data.message || 'Gagal membuat tagihan.');
            }

        } catch (err: unknown) {
            let errorMessage = "Terjadi kesalahan";
            if (err instanceof Error) errorMessage = err.message;
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const daysRemaining = selectedChild ? Math.ceil((new Date(formData.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="rounded-xl bg-white p-6 shadow-xl border border-login-pink/50">
            <h2 className="text-xl font-bold text-brand-purple mb-4">
                Buat Tagihan Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Pilih Anak */}
                <div>
                    <label htmlFor="child_id" className="block text-sm font-medium text-gray-700">Anak Didik</label>
                    <select
                        id="child_id"
                        name="child_id"
                        value={formData.child_id}
                        onChange={handleChange}
                        disabled={isLoadingChildren || isSubmitting}
                        className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                        required
                    >
                        <option value="" disabled>{isLoadingChildren ? "Memuat..." : "Pilih Anak"}</option>
                        {childList.map((child) => (
                            <option key={child._id} value={child._id}>
                                {child.name} (Rp{child.monthly_fee.toLocaleString('id-ID')})
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Kategori Tagihan */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                        >
                            <option value="Bulanan">Bulanan</option>
                            <option value="Semester">Semester</option>
                            <option value="Registrasi">Registrasi (Manual)</option>
                        </select>
                    </div>
                    {/* 3. Periode */}
                    {formData.category !== 'Registrasi' && (
                        <div>
                            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Periode</label>
                            <input
                                type="text"
                                id="period"
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                placeholder={formData.category === 'Bulanan' ? 'YYYY-MM' : 'YYYY-1'}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* 4. Jumlah & Jatuh Tempo */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={formData.category !== 'Registrasi'} 
                            className={`w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors ${formData.category !== 'Registrasi' ? 'bg-gray-100' : ''}`}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Jatuh Tempo</label>
                        <input
                            type="date"
                            id="due_date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                            required
                        />
                        {daysRemaining !== null && (
                            <p className={`mt-1 text-xs ${daysRemaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                {daysRemaining < 0 ? `Terlambat ${Math.abs(daysRemaining)} hari` : `Tersisa ${daysRemaining} hari`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Notifikasi & Tombol Submit */}
                {message.text && (
                    <div className={`rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.child_id}
                    className="w-full flex items-center justify-center rounded-lg bg-login-pink py-2 px-4 text-sm font-semibold text-white shadow-md hover:bg-opacity-90 disabled:bg-pink-300"
                >
                    <FiSend className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Memproses...' : 'Buat Tagihan'}
                </button>
            </form>
        </div>
    );
}

export default function AdminBillingPage() {
    const [allPayments, setAllPayments] = useState<Payment[]>([]); 
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]); 
    const [children, setChildren] = useState<Child[]>([]); 
    
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

    const fetchPaymentsAndChildren = useCallback(async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token Admin tidak ditemukan.');

            const childrenRes = await fetch(apiUrl('/children'), { headers: { 'Authorization': `Bearer ${token}` } });
            const childrenData = await childrenRes.json();
            if (childrenData.success) {
                const transformedChildren: Child[] = childrenData.children.map((c: Record<string, unknown>) => ({
                    _id: c._id,
                    name: c.name,
                    monthly_fee: c.monthly_fee || 0,
                    semester_fee: c.semester_fee || 0,
                }));
                setChildren(transformedChildren);
            } else {
                throw new Error(childrenData.message || 'Gagal mengambil data anak');
            }

            const paymentsRes = await fetch(apiUrl('/payments?limit=500'), { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const paymentsData = await paymentsRes.json();
            if (paymentsData.success) {
                setAllPayments(paymentsData.payments); 
            } else {
                throw new Error(paymentsData.message || 'Gagal mengambil data pembayaran');
            }
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoading(false); 
        }
    }, []); 

    useEffect(() => {
        if (allPayments.length === 0 && isInitialLoad.current) {
            return; 
        }
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            setFilteredPayments(allPayments.filter(p => p.status === 'Terkirim'));
            return;
        }

        setIsFiltering(true);
        
        setTimeout(() => {
            let filtered: Payment[] = [];
            if (filterStatus === 'Semua') {
                filtered = allPayments;
            } else if (filterStatus === 'Menunggu') {
                filtered = allPayments.filter(p => p.status === 'Tertunda' || p.status === 'Terkirim');
            } else if (filterStatus === 'Terlambat') {
                filtered = allPayments.filter(p => p.status === 'Jatuh Tempo' || p.status === 'Ditolak');
            } else {
                filtered = allPayments.filter(p => p.status === filterStatus);
            }
            setFilteredPayments(filtered);
            setIsFiltering(false);
        }, 300);
        
    }, [filterStatus, allPayments]); 

    useEffect(() => {
        fetchPaymentsAndChildren();
    }, [fetchPaymentsAndChildren]); 

    const handleUpdateStatus = async (paymentId: string, status: 'Dibayar' | 'Ditolak', reason: string = '') => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) { alert('Token hilang.'); return; }
            
            const body: { status: string, rejection_reason?: string } = { status };
            if (status === 'Ditolak' && reason) { body.rejection_reason = reason; }

            const response = await fetch(apiUrl(`/payments/${paymentId}/status`), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                alert(`Pembayaran berhasil di-${status.toLowerCase()}!`);
                setAllPayments(currentPayments => 
                    currentPayments.map(p => p._id === paymentId ? data.payment : p)
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

    const handleCreateSuccess = () => {
        fetchPaymentsAndChildren();
        setFilterStatus('Semua'); 
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dibayar': return 'bg-green-100 text-green-800';
            case 'Terkirim': return 'bg-blue-100 text-blue-800'; 
            case 'Ditolak': return 'bg-red-100 text-red-800';
            case 'Jatuh Tempo': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Dibayar': return <FiCheckCircle className="h-5 w-5 text-green-500" />;
            case 'Terkirim': return <FiClock className="h-5 w-5 text-blue-500" />;
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

    const totalTerkirim = allPayments.filter(p => p.status === 'Terkirim').length;
    const totalTertunda = allPayments.filter(p => p.status === 'Tertunda').length;
    const totalPaid = allPayments.filter(p => p.status === 'Dibayar').length;
    const totalOverdue = allPayments.filter(p => p.status === 'Jatuh Tempo' || p.status === 'Ditolak').length;

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

            <h1 className="font-rammetto text-3xl font-bold text-brand-purple">
                Manajemen Tagihan
            </h1>

            {error && ( <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div> )}
            
            {children.length > 0 && (
                <CreatePaymentForm 
                    childList={children}
                    isLoadingChildren={isLoading}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <h1 className="font-rammetto pt-10 text-3xl font-bold text-brand-purple">
                Statistik Tagihan
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    type="button"
                    onClick={() => handleFilterClick('Terkirim')} 
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${filterStatus === 'Terkirim' 
                            ? 'bg-blue-100 border-blue-500 shadow-lg' 
                            : 'bg-blue-50 border-blue-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Butuh Verifikasi</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalTerkirim}</p>
                        </div>
                        <FiClock className="h-8 w-8 text-blue-500" />
                    </div>
                </button>
                
                <button
                    type="button"
                    onClick={() => handleFilterClick('Tertunda')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${filterStatus === 'Tertunda' 
                            ? 'bg-yellow-100 border-yellow-500 shadow-lg' 
                            : 'bg-yellow-50 border-yellow-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tertunda</p>
                            <p className="text-2xl font-bold text-brand-purple">{isLoading ? '...' : totalTertunda}</p>
                        </div>
                        <FiClock className="h-8 w-8 text-yellow-500" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => handleFilterClick('Terlambat')}
                    className={`rounded-xl p-6 border-l-4 text-left transition-all hover:scale-105
                        ${(filterStatus === 'Jatuh Tempo' || filterStatus === 'Ditolak') 
                            ? 'bg-red-100 border-red-500 shadow-lg' 
                            : 'bg-red-50 border-red-500'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Jatuh Tempo / Ditolak</p>
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
                                        {/* Tombol Aksi (Tolak/Setujui) */}
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
                    <div className="w-[600px] h-[800px] overflow-hidden max-w-lg max-h-[80vh] flex items-center justify-center">
                        <Image 
                            src={viewingProof} 
                            alt="Bukti Pembayaran" 
                            width={600} 
                            height={800} 
                            className="object-contain" 
                        />
                    </div>
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { 
    FiArrowLeft, FiSend, FiList, FiTrash2, FiLoader, FiBookOpen, 
    FiSunrise, FiMoon, FiFileText, FiHeart, FiActivity, FiUser, FiCoffee, FiCalendar
} from 'react-icons/fi';

interface Child {
    _id: string;
    name: string;
}

interface Teacher {
    _id: string;
    name: string;
    email: string;
}

interface DailyReport {
    _id: string;
    child_id: Child; 
    teacher_id: Teacher; 
    date: string;
    theme: string;
    sub_theme: string;
    physical_motor: string;
    cognitive: string;
    social_emotional: string;
    meals: { 
        snack: string;
        lunch: string;
    };
    nap_duration: string;
    special_notes: string;
    createdAt: string;
}

interface ReportFormData {
    child_id: string;
    date: string;
    theme: string;
    sub_theme: string;
    physical_motor: string;
    cognitive: string;
    social_emotional: string;
    meals: {
        snack: string;
        lunch: string;
    };
    nap_duration: string;
    special_notes: string;
}

const initialReportData: Omit<ReportFormData, 'child_id' | 'date'> = {
    theme: '',
    sub_theme: '',
    physical_motor: '',
    cognitive: '',
    social_emotional: '',
    meals: { snack: '', lunch: '' },
    nap_duration: '',
    special_notes: ''
};

export default function DailyReportPage() {
    const [children, setChildren] = useState<Child[]>([]); 
    const [myReports, setMyReports] = useState<DailyReport[]>([]); 
    
    const [formData, setFormData] = useState<ReportFormData>({
        child_id: '',
        date: new Date().toISOString().split('T')[0],
        ...initialReportData
    });
    
    const [isLoadingChildren, setIsLoadingChildren] = useState(true);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchChildren = useCallback(async (token: string) => {
        setIsLoadingChildren(true);
        try {
            const response = await fetch('http://localhost:3000/api/children', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
                if (data.children.length > 0) {
                    setFormData(prev => ({...prev, child_id: data.children[0]._id}));
                }
            } else {
                throw new Error(data.message || 'Gagal mengambil data anak');
            }
        } catch (err: unknown) { 
            let errorMessage = "Gagal fetch data anak";
            if (err instanceof Error) errorMessage = err.message;
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoadingChildren(false);
        }
    }, []);

    const fetchMyReports = useCallback(async (token: string) => {
        setIsLoadingReports(true);
        try {
            const response = await fetch('http://localhost:3000/api/daily-reports/my-reports', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                const sortedReports = data.reports.sort((a: DailyReport, b: DailyReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setMyReports(sortedReports);
            } else {
                throw new Error(data.message || 'Gagal mengambil laporan');
            }
        } catch (err: unknown) { 
            let errorMessage = "Gagal fetch laporan";
            if (err instanceof Error) errorMessage = err.message;
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoadingReports(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage({ type: 'error', text: 'Token tidak ditemukan. Silakan login kembali.'});
            return;
        }
        fetchChildren(token);
        fetchMyReports(token);
    }, [fetchChildren, fetchMyReports]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'snack' || name === 'lunch') {
            setFormData(prev => ({
                ...prev,
                meals: {
                    ...prev.meals,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' }); 

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await fetch('http://localhost:3000/api/daily-reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData) 
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Laporan harian berhasil dibuat!' });
                setFormData(prev => ({
                    ...initialReportData, 
                    child_id: prev.child_id, 
                    date: prev.date, 
                }));
                fetchMyReports(token); 
            } else {
                throw new Error(data.message || 'Terjadi kesalahan');
            }
        } catch (err: unknown) {
            let errorMessage = "Gagal mengirim laporan";
            if (err instanceof Error) errorMessage = err.message;
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reportId: string) => {
        if (!confirm('Yakin mau hapus laporan ini?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await fetch(`http://localhost:3000/api/daily-reports/${reportId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                alert('Laporan berhasil dihapus');
                setMyReports(prev => prev.filter(r => r._id !== reportId));
            } else {
                throw new Error(data.message || 'Gagal menghapus laporan');
            }
        } catch (err: unknown) {
            let errorMessage = "Gagal menghapus";
            if (err instanceof Error) errorMessage = err.message;
            alert(errorMessage);
        }
    };
    
    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            <PageHeader title="Buat Laporan Harian" description="Isi aktivitas dan perkembangan anak hari ini" />

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="child_id" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiUser className="h-4 w-4 inline mr-1" />
                                Pilih Anak
                            </label>
                            <select
                                id="child_id"
                                name="child_id"
                                value={formData.child_id}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                required
                            >
                                <option value="" disabled>
                                    {isLoadingChildren ? "Memuat anak..." : "Pilih salah satu anak"}
                                </option>
                                {children.map((child) => (
                                    <option key={child._id} value={child._id}>
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiCalendar className="h-4 w-4 inline mr-1" />
                                Tanggal
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="theme" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiBookOpen className="h-4 w-4 inline mr-1" />
                                Tema Hari Ini
                            </label>
                            <input
                                type="text"
                                id="theme"
                                name="theme"
                                value={formData.theme}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                placeholder="Contoh: Binatang"
                            />
                        </div>
                        <div>
                            <label htmlFor="sub_theme" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiBookOpen className="h-4 w-4 inline mr-1" />
                                Sub-Tema
                            </label>
                            <input
                                type="text"
                                id="sub_theme"
                                name="sub_theme"
                                value={formData.sub_theme}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                placeholder="Contoh: Binatang di Air"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="physical_motor" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiActivity className="h-4 w-4 inline mr-1" />
                                Fisik & Motorik
                            </label>
                            <textarea
                                id="physical_motor"
                                name="physical_motor"
                                value={formData.physical_motor}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                rows={3}
                                placeholder="Aktivitas fisik hari ini..."
                            />
                        </div>
                        <div>
                            <label htmlFor="cognitive" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiSunrise className="h-4 w-4 inline mr-1" />
                                Kognitif
                            </label>
                            <textarea
                                id="cognitive"
                                name="cognitive"
                                value={formData.cognitive}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                rows={3}
                                placeholder="Aktivitas kognitif hari ini..."
                            />
                        </div>
                        <div>
                            <label htmlFor="social_emotional" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiHeart className="h-4 w-4 inline mr-1" />
                                Sosial & Emosional
                            </label>
                            <textarea
                                id="social_emotional"
                                name="social_emotional"
                                value={formData.social_emotional}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                rows={3}
                                placeholder="Aktivitas sosial hari ini..."
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="snack" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiCoffee className="h-4 w-4 inline mr-1" />
                                Camilan (Snack)
                            </label>
                            <input
                                type="text"
                                id="snack"
                                name="snack"
                                value={formData.meals.snack}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                placeholder="Contoh: Bubur kacang ijo"
                            />
                        </div>
                        <div>
                            <label htmlFor="lunch" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiCoffee className="h-4 w-4 inline mr-1" />
                                Makan Siang
                            </label>
                            <input
                                type="text"
                                id="lunch"
                                name="lunch"
                                value={formData.meals.lunch}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                placeholder="Contoh: Nasi, Sup, Ayam"
                            />
                        </div>
                        <div>
                            <label htmlFor="nap_duration" className="block text-sm font-semibold text-brand-purple mb-2">
                                <FiMoon className="h-4 w-4 inline mr-1" />
                                Tidur Siang (Menit)
                            </label>
                            <input
                                type="number"
                                id="nap_duration"
                                name="nap_duration"
                                value={formData.nap_duration}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                                placeholder="Contoh: 90"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="special_notes" className="block text-sm font-semibold text-brand-purple mb-2">
                            <FiFileText className="h-4 w-4 inline mr-1" />
                            Catatan Khusus
                        </label>
                        <textarea
                            id="special_notes"
                            name="special_notes"
                            value={formData.special_notes}
                            onChange={handleFormChange}
                            className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                            rows={3}
                            placeholder="Catatan tambahan (misal: perlu bawa popok, dll)"
                        />
                    </div>

                    {message.text && (
                        <div className={`rounded-md p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingChildren}
                        className="w-full flex items-center justify-center rounded-lg bg-login-pink py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90
                                disabled:cursor-not-allowed disabled:bg-pink-300"
                    >
                        {isSubmitting ? (
                            <FiLoader className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <FiSend className="h-5 w-5 mr-2" />
                                Simpan Laporan Hari Ini
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <h2 className="mb-4 text-xl font-bold text-brand-purple">
                    <FiList className="h-5 w-5 inline mr-2" />
                    Laporan yang Baru Dibuat
                </h2>
                {isLoadingReports ? (
                    <div className="text-center text-gray-500">Memuat laporan...</div>
                ) : myReports.length > 0 ? (
                    <div className="space-y-3">
                        {myReports.slice(0, 5).map((report) => ( // Tampilkan 5 terbaru
                            <div key={report._id} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-brand-purple">{report.child_id.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(report.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Tema: {report.theme || '-'}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(report._id)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                    aria-label="Hapus laporan"
                                >
                                    <FiTrash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        Belum ada laporan yang dibuat.
                    </div>
                )}
            </div>
        </div>
    );
}
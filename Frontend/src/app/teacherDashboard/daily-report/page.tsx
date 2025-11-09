"use client";

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Child {
    _id: string;
    name: string;
}

interface DailyReport {
    _id: string;
    child: Child;
    date: string;
    activities: string;
    healthStatus: 'Good' | 'Sick' | 'Tired' | 'Energetic';
    meals: string;
    mood: 'Happy' | 'Sad' | 'Calm' | 'Excited' | 'Irritable';
    notes: string;
    createdAt: string;
}

export default function DailyReportPage() {
    const [childId, setChildId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activities, setActivities] = useState('');
    const [healthStatus, setHealthStatus] = useState<'Good' | 'Sick' | 'Tired' | 'Energetic'>('Good');
    const [meals, setMeals] = useState('');
    const [mood, setMood] = useState<'Happy' | 'Sad' | 'Calm' | 'Excited' | 'Irritable'>('Happy');
    const [notes, setNotes] = useState('');
    const [children, setChildren] = useState<Child[]>([]);
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchChildren();
        fetchReports();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await fetch('/api/children');
            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    };

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/daily-reports');
            const data = await response.json();
            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    childId,
                    date,
                    activities,
                    healthStatus,
                    meals,
                    mood,
                    notes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Laporan harian berhasil dibuat!' });
                setChildId('');
                setActivities('');
                setMeals('');
                setNotes('');
                fetchReports();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim laporan' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            <h1 className="text-3xl font-bold text-brand-purple">Buat Laporan Harian</h1>

            <div className="rounded-lg bg-white p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="child" className="block text-sm font-medium text-gray-700">
                            Pilih Anak
                        </label>
                        <select
                            id="child"
                            value={childId}
                            onChange={(e) => setChildId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            required
                        >
                            <option value="">Pilih Anak</option>
                            {children.map((child) => (
                                <option key={child._id} value={child._id}>
                                    {child.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
                            Aktivitas Harian
                        </label>
                        <textarea
                            id="activities"
                            value={activities}
                            onChange={(e) => setActivities(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={3}
                            placeholder="Deskripsikan aktivitas yang dilakukan anak hari ini"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700">
                            Kondisi Kesehatan
                        </label>
                        <select
                            id="healthStatus"
                            value={healthStatus}
                            onChange={(e) => setHealthStatus(e.target.value as 'Good' | 'Sick' | 'Tired' | 'Energetic')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            required
                        >
                            <option value="Good">Baik</option>
                            <option value="Sick">Sakit</option>
                            <option value="Tired">Lelah</option>
                            <option value="Energetic">Enerjik</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="meals" className="block text-sm font-medium text-gray-700">
                            Makanan yang Dikonsumsi
                        </label>
                        <textarea
                            id="meals"
                            value={meals}
                            onChange={(e) => setMeals(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={2}
                            placeholder="Jenis makanan dan minuman yang dikonsumsi"
                        />
                    </div>

                    <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                            Suasana Hati
                        </label>
                        <select
                            id="mood"
                            value={mood}
                            onChange={(e) => setMood(e.target.value as 'Happy' | 'Sad' | 'Calm' | 'Excited' | 'Irritable')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            required
                        >
                            <option value="Happy">Bahagia</option>
                            <option value="Sad">Sedih</option>
                            <option value="Calm">Tenang</option>
                            <option value="Excited">Bergairah</option>
                            <option value="Irritable">Mudah Marah</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Catatan Tambahan
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={3}
                            placeholder="Catatan tambahan tentang perkembangan anak"
                        />
                    </div>

                    {message.text && (
                        <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-brand-purple px-4 py-2 text-white hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Harian'}
                    </button>
                </form>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Laporan Harian Terbaru</h2>
                {isLoading ? (
                    <div className="text-center text-gray-500">Memuat data...</div>
                ) : reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.slice(0, 5).map((report) => (
                            <div key={report._id} className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{report.child.name}</h3>
                                        <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            report.healthStatus === 'Good' ? 'bg-green-100 text-green-800' :
                                            report.healthStatus === 'Sick' ? 'bg-red-100 text-red-800' :
                                            report.healthStatus === 'Tired' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {report.healthStatus === 'Good' ? 'Baik' :
                                             report.healthStatus === 'Sick' ? 'Sakit' :
                                             report.healthStatus === 'Tired' ? 'Lelah' : 'Enerjik'}
                                        </span>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            report.mood === 'Happy' ? 'bg-yellow-100 text-yellow-800' :
                                            report.mood === 'Sad' ? 'bg-gray-100 text-gray-800' :
                                            report.mood === 'Calm' ? 'bg-blue-100 text-blue-800' :
                                            report.mood === 'Excited' ? 'bg-pink-100 text-pink-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {report.mood === 'Happy' ? 'Bahagia' :
                                             report.mood === 'Sad' ? 'Sedih' :
                                             report.mood === 'Calm' ? 'Tenang' :
                                             report.mood === 'Excited' ? 'Bergairah' : 'Mudah Marah'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600"><strong>Aktivitas:</strong> {report.activities}</p>
                                    {report.meals && <p className="text-sm text-gray-600"><strong>Makanan:</strong> {report.meals}</p>}
                                    {report.notes && <p className="text-sm text-gray-600"><strong>Catatan:</strong> {report.notes}</p>}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Dibuat pada: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        Belum ada laporan harian
                    </div>
                )}
            </div>
        </div>
    );
}
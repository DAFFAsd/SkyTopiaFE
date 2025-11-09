"use client";

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Attendance {
    _id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
    note: string;
}

export default function AttendancePage() {
    const [status, setStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        try {
            const response = await fetch('/api/attendance');
            const data = await response.json();
            if (data.success) {
                setAttendanceHistory(data.records);
            }
        } catch (error) {
            console.error('Error fetching attendance history:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date,
                    status,
                    note,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Absensi berhasil dicatat!' });
                setNote('');
                fetchAttendanceHistory();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim data' });
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
            <h1 className="text-3xl font-bold text-brand-purple">Catat Absensi</h1>
            
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status Kehadiran
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Present' | 'Absent' | 'Leave')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            required
                        >
                            <option value="Present">Hadir</option>
                            <option value="Absent">Tidak Hadir</option>
                            <option value="Leave">Izin</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                            Catatan
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={3}
                            placeholder="Tambahkan catatan jika diperlukan"
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
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Absensi'}
                    </button>
                </form>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Riwayat Absensi</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {attendanceHistory.map((record) => (
                                <tr key={record._id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {new Date(record.date).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                            record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                            record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {record.status === 'Present' ? 'Hadir' :
                                             record.status === 'Absent' ? 'Tidak Hadir' : 'Izin'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{record.note || '-'}</td>
                                </tr>
                            ))}
                            {attendanceHistory.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada riwayat absensi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
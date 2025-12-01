"use client";

import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface ClockRecord {
    status: 'Present' | 'Absent' | 'Leave';
    timestamp?: string;
    note?: string;
    leavePhoto?: string;
}

interface Attendance {
    _id: string;
    date: string;
    clockIn: ClockRecord;
    clockOut?: ClockRecord;
}

export default function AttendancePage() {
    const [status, setStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
    const [note, setNote] = useState('');
    const [clockOutNote, setClockOutNote] = useState('');
    const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
    const [isSubmittingIn, setIsSubmittingIn] = useState(false);
    const [isSubmittingOut, setIsSubmittingOut] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceHistory.find((record) => record.date.split('T')[0] === today);
    const hasClockIn = Boolean(todayAttendance?.clockIn?.timestamp);
    const hasClockOut = Boolean(todayAttendance?.clockOut?.timestamp);

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Token tidak ditemukan. Silakan login kembali' });
                return;
            }

            const response = await fetch('/api/attendances/my-records', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAttendanceHistory(data.records);
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal memuat riwayat absensi' });
            }
        } catch (error) {
            console.error('Error fetching attendance history:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat memuat riwayat absensi' });
        }
    };


    const handleClockIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingIn(true);
        setMessage({ type: '', text: '' });

        if (hasClockIn) {
            setMessage({ type: 'error', text: 'Clock in hanya bisa dilakukan sekali per hari.' });
            setIsSubmittingIn(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Token tidak ditemukan. Silakan login kembali' });
                setIsSubmittingIn(false);
                return;
            }

            const response = await fetch('/api/attendances/clock-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status,
                    note,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Clock in berhasil! Jam masuk tercatat.' });
                setNote('');
                setStatus('Present');
                fetchAttendanceHistory();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat clock in' });
        } finally {
            setIsSubmittingIn(false);
        }
    };

    const handleClockOut = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingOut(true);
        setMessage({ type: '', text: '' });

        if (!hasClockIn) {
            setMessage({ type: 'error', text: 'Silakan lakukan clock in terlebih dahulu.' });
            setIsSubmittingOut(false);
            return;
        }

        if (hasClockOut) {
            setMessage({ type: 'error', text: 'Clock out hari ini sudah tercatat.' });
            setIsSubmittingOut(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Token tidak ditemukan. Silakan login kembali' });
                setIsSubmittingOut(false);
                return;
            }

            const response = await fetch('/api/attendances/clock-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'Present',
                    note: clockOutNote,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Clock out berhasil! Jam pulang tercatat.' });
                setClockOutNote('');
                fetchAttendanceHistory();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Terjadi kesalahan saat clock out' });
        } finally {
            setIsSubmittingOut(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            <PageHeader title="Catat Absensi" description="Catat kehadiran harian Anda" />

            {/* Clock In Section */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Jam Masuk</h2>
                <form onSubmit={handleClockIn} className="space-y-4">
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
                            Catatan (Opsional)
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={2}
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
                        disabled={isSubmittingIn || hasClockIn}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
                    >
                        <FiCheck className="h-5 w-5" />
                        {isSubmittingIn ? 'Menyimpan...' : hasClockIn ? 'Sudah Clock In' : 'Clock In'}
                    </button>
                </form>
                {todayAttendance?.clockIn && (
                    <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                        ✓ Jam masuk: {new Date(todayAttendance.clockIn.timestamp!).toLocaleTimeString('id-ID')}
                    </div>
                )}
            </div>

            {/* Clock Out Section */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Jam Pulang</h2>
                <form onSubmit={handleClockOut} className="space-y-4">
                    <div>
                        <label htmlFor="clockOutNote" className="block text-sm font-medium text-gray-700">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            id="clockOutNote"
                            value={clockOutNote}
                            onChange={(e) => setClockOutNote(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                            rows={2}
                            placeholder="Tambahkan catatan jika diperlukan"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmittingOut || !hasClockIn || hasClockOut}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
                    >
                        <FiX className="h-5 w-5" />
                        {isSubmittingOut ? 'Menyimpan...' : !hasClockIn ? 'Clock In Dulu' : hasClockOut ? 'Sudah Clock Out' : 'Clock Out'}
                    </button>
                </form>
                {todayAttendance?.clockOut && (
                    <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                        ✓ Jam pulang: {new Date(todayAttendance.clockOut.timestamp!).toLocaleTimeString('id-ID')}
                    </div>
                )}
            </div>

            {/* Attendance History */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Riwayat Absensi</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Masuk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pulang</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {attendanceHistory.map((record) => (
                                <tr key={record._id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {new Date(record.date).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${record.clockIn.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    record.clockIn.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {record.clockIn.status === 'Present' ? 'Hadir' :
                                                    record.clockIn.status === 'Absent' ? 'Tidak Hadir' : 'Izin'}
                                            </span>
                                            {record.clockIn.timestamp && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(record.clockIn.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {record.clockOut ? (
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${record.clockOut.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                        record.clockOut.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {record.clockOut.status === 'Present' ? 'Hadir' :
                                                        record.clockOut.status === 'Absent' ? 'Tidak Hadir' : 'Izin'}
                                                </span>
                                                {record.clockOut.timestamp && (
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(record.clockOut.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {record.clockIn.note || '-'}
                                    </td>
                                </tr>
                            ))}
                            {attendanceHistory.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
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
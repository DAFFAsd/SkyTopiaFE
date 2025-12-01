"use client";

import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiX, FiCamera } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

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
    const [status, setStatus] = useState<'Present' | 'Leave'>('Present');
    const [note, setNote] = useState('');
    const [leavePhoto, setLeavePhoto] = useState<File | null>(null);
    const [leavePhotoPreview, setLeavePhotoPreview] = useState<string>('');
    const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
    const [isSubmittingIn, setIsSubmittingIn] = useState(false);
    const [isSubmittingOut, setIsSubmittingOut] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceHistory.find((record) => record.date.split('T')[0] === today);
    const hasClockIn = Boolean(todayAttendance?.clockIn?.timestamp);
    const hasClockOut = Boolean(todayAttendance?.clockOut?.timestamp);

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const uploadPhotoToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'skytopia');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dxq8ydbtk/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            throw new Error('Gagal mengupload foto');
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLeavePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLeavePhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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

        if (status === 'Leave' && !leavePhoto) {
            setMessage({ type: 'error', text: 'Foto izin wajib diupload' });
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

            let photoUrl = '';
            if (status === 'Leave' && leavePhoto) {
                photoUrl = await uploadPhotoToCloudinary(leavePhoto);
            }

            const response = await fetch('/api/attendances/clock-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status,
                    note: status === 'Leave' ? note : '',
                    leavePhoto: photoUrl,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Clock in berhasil! Jam masuk tercatat.' });
                setNote('');
                setLeavePhoto(null);
                setLeavePhotoPreview('');
                setStatus('Present');
                fetchAttendanceHistory();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Terjadi kesalahan saat clock in' });
        } finally {
            setIsSubmittingIn(false);
        }
    };

    const handleClockOut = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingOut(true);
        setMessage({ type: '', text: '' });

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
                    note: '',
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Clock out berhasil! Jam pulang tercatat.' });
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
            <h1 className="text-3xl font-bold text-brand-purple">Catat Absensi</h1>

            {/* Global Message Notification */}
            {message.text && (
                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            {/* Clock In & Clock Out Combined Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Pencatatan Absensi</h2>

                {/* Status Selection */}
                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'Present' | 'Leave')}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                        required
                    >
                        <option value="Present">Hadir</option>
                        <option value="Leave">Izin</option>
                    </select>
                </div>

                {/* Leave Photo & Note - Only show for Leave */}
                {status === 'Leave' && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="leavePhoto" className="block text-sm font-medium text-gray-700">
                                Foto Izin
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 rounded-md border-2 border-dashed border-brand-purple px-3 py-2 text-sm text-brand-purple hover:bg-brand-purple/5"
                                >
                                    <FiCamera className="h-4 w-4" />
                                    Pilih
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="leavePhoto"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    required
                                />
                                {leavePhotoPreview && (
                                    <div className="h-10 w-10 overflow-hidden rounded-md">
                                        <img src={leavePhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                            {leavePhoto && <p className="mt-1 text-xs text-green-600">✓ {leavePhoto.name}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                                Catatan
                            </label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                                rows={2}
                                placeholder="Alasan izin"
                            />
                        </div>
                    </>
                )}

                {/* Clock In & Clock Out Buttons - Side by side for Hadir */}
                {status === 'Leave' ? (
                    <button
                        type="button"
                        onClick={handleClockIn}
                        disabled={isSubmittingIn || hasClockIn}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
                    >
                        <FiCheck className="h-4 w-4" />
                        {isSubmittingIn ? 'Menyimpan...' : hasClockIn ? 'Sudah Submit Izin' : 'Submit Izin'}
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleClockIn}
                            disabled={isSubmittingIn || hasClockIn}
                            className="flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
                        >
                            <FiCheck className="h-4 w-4" />
                            {isSubmittingIn ? 'Masuk...' : hasClockIn ? 'Masuk' : 'Datang'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClockOut}
                            disabled={isSubmittingOut}
                            className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
                        >
                            <FiX className="h-4 w-4" />
                            {isSubmittingOut ? 'Pulang...' : hasClockOut ? 'Pulang' : 'Pulang'}
                        </button>
                    </div>
                )}

                {/* Status Display */}
                {todayAttendance?.clockIn && (
                    <div className="mt-3 flex gap-2 text-xs">
                        <div className="rounded-md bg-green-50 p-2 flex-1 text-green-700">
                            ✓ Masuk: {new Date(todayAttendance.clockIn.timestamp!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {todayAttendance?.clockOut && (
                            <div className="rounded-md bg-blue-50 p-2 flex-1 text-blue-700">
                                ✓ Pulang: {new Date(todayAttendance.clockOut.timestamp!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
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
                                            <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${
                                                record.clockIn.status === 'Present' ? 'bg-green-100 text-green-800' :
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
                                                <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    record.clockOut.status === 'Present' ? 'bg-green-100 text-green-800' :
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
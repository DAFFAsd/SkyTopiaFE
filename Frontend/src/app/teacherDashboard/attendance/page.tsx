'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiLoader, FiDownload, FiFilter,  FiArrowLeft } from 'react-icons/fi';

interface AttendanceRecord {
    _id: string;
    teacher: {
        _id: string;
        name: string;
        email: string;
    };
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
    note?: string;
    createdAt: string;
    }

    interface Teacher {
    _id: string;
    name: string;
    email: string;
    }

    export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        fetchTeachers();
        fetchAttendance();
    }, []);

    const fetchTeachers = async () => {
        try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/users?role=Teacher', {
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setTeachers(data.users || []);
        }
        } catch (err) {
        console.error('Failed to fetch teachers:', err);
        }
    };

    const fetchAttendance = async (tId?: string, sDate?: string, eDate?: string) => {
        try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const params = new URLSearchParams();
        if (tId && tId !== 'all') params.append('teacherId', tId);
        if (sDate) params.append('startDate', sDate);
        if (eDate) params.append('endDate', eDate);

        const response = await fetch(`http://localhost:3000/api/attendance?${params.toString()}`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setRecords(data.records || []);
        }
        } catch (err) {
        console.error('Failed to fetch attendance:', err);
        setError('Gagal mengambil data absensi');
        } finally {
        setLoading(false);
        }
    };

    const handleFilter = () => {
        fetchAttendance(selectedTeacher, startDate, endDate);
    };

    const handleReset = () => {
        setSelectedTeacher('all');
        setStartDate('');
        setEndDate('');
        setSelectedStatus('all');
        fetchAttendance();
    };

    const filteredRecords = records.filter(record => {
        if (selectedStatus !== 'all' && record.status !== selectedStatus) {
        return false;
        }
        return true;
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
        case 'Present':
            return 'bg-green-100 text-green-800';
        case 'Absent':
            return 'bg-red-100 text-red-800';
        case 'Leave':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
        case 'Present':
            return 'Hadir';
        case 'Absent':
            return 'Absen';
        case 'Leave':
            return 'Cuti';
        default:
            return status;
        }
    };

    const exportToCSV = () => {
        const headers = ['Nama Guru', 'Email', 'Tanggal', 'Status', 'Catatan'];
        const rows = filteredRecords.map(record => [
        record.teacher.name,
        record.teacher.email,
        new Date(record.date).toLocaleDateString('id-ID'),
        getStatusLabel(record.status),
        record.note || '-'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `absensi-guru-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const statistics = {
        total: filteredRecords.length,
        present: filteredRecords.filter(r => r.status === 'Present').length,
        absent: filteredRecords.filter(r => r.status === 'Absent').length,
        leave: filteredRecords.filter(r => r.status === 'Leave').length,
    };

    if (loading) {
        return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-brand-purple">Absensi Guru</h1>
            <div className="flex justify-center items-center py-8">
            <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
            </div>
        </div>
        );
    }

    return (
        <div className="space-y-4">
        <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>
        <h1 className="text-2xl font-bold text-brand-purple">Absensi Guru</h1>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Absensi</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Hadir</p>
            <p className="text-2xl font-bold text-green-600">{statistics.present}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Absen</p>
            <p className="text-2xl font-bold text-red-600">{statistics.absent}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Cuti</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.leave}</p>
            </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FiFilter className="h-5 w-5" />
                <span>Filter Data</span>
            </h3>
            <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-900"
            >
                Reset Filter
            </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Guru
                </label>
                <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                >
                <option value="all">Semua Guru</option>
                {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                    </option>
                ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
                </label>
                <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                >
                <option value="all">Semua Status</option>
                <option value="Present">Hadir</option>
                <option value="Absent">Absen</option>
                <option value="Leave">Cuti</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Dari Tanggal
                </label>
                <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampai Tanggal
                </label>
                <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
            </div>
            </div>

            <div className="flex gap-2">
            <button
                onClick={handleFilter}
                className="bg-brand-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
            >
                Terapkan Filter
            </button>
            <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center space-x-2"
            >
                <FiDownload className="h-4 w-4" />
                <span>Export CSV</span>
            </button>
            </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Guru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                    <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.teacher.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                        })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {record.note || '-'}
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data absensi
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}
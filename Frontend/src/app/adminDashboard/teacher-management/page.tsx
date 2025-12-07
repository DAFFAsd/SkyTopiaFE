'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiLoader, FiX, FiMail, FiPhone, FiArrowLeft, FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../../components/PageHeader';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  clockIn: {
    status: 'Present' | 'Absent' | 'Leave';
    timestamp?: string;
    note?: string;
  };
  clockOut?: {
    status: 'Present' | 'Absent' | 'Leave';
    timestamp?: string;
    note?: string;
    leavePhoto?: string;
  };
  createdAt: string;
}

export default function TeacherManagementPage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'attendance'>('teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Attendance filter states
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetchTeachers();
    } else {
      fetchAttendance();
    }
  }, [activeTab]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
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
      setError('Gagal mengambil data guru');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (tId?: string, sDate?: string, eDate?: string, status?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (tId && tId !== 'all') params.append('teacherId', tId);
      if (sDate) params.append('startDate', sDate);
      if (eDate) params.append('endDate', eDate);
      if (status && status !== 'all') params.append('status', status);

      const response = await fetch(`http://localhost:3000/api/attendances?${params.toString()}`, {
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

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setShowModal(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      password: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const url = editingTeacher
        ? apiUrl(`/users/${editingTeacher._id}`)
        : apiUrl('/register');

      const method = editingTeacher ? 'PUT' : 'POST';

      const data: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (editingTeacher) {
        if (formData.password) {
          data.password = formData.password;
        }
      } else {
        data.password = formData.password;
        data.role = 'Teacher';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to save teacher');
      }

      await fetchTeachers();
      closeModal();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete teacher');
      }

      setTeachers(teachers.filter(t => t._id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFilter = () => {
    fetchAttendance(selectedTeacher, startDate, endDate, selectedStatus);
  };

  const handleReset = () => {
    setSelectedTeacher('all');
    setStartDate('');
    setEndDate('');
    setSelectedStatus('all');
    fetchAttendance();
  };

  const deleteAttendanceRecord = async (recordId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/attendances/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete attendance record');
      }

      await fetchAttendance(selectedTeacher, startDate, endDate, selectedStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    }
  };

  const deleteAllAttendance = async () => {
    if (!confirm('PERHATIAN! Ini akan menghapus SEMUA data absensi. Lanjutkan?')) return;
    if (!confirm('Konfirmasi lagi: Hapus semua data absensi?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:3000/api/attendances', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete all attendance records');
      }

      setRecords([]);
      setError(null);
      alert(`${data.deletedCount} data absensi berhasil dihapus`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    }
  };

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
    const headers = ['Nama Guru', 'Email', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status Masuk', 'Status Pulang', 'Catatan'];
    const rows = filteredRecords.map(record => [
      record.teacher.name,
      record.teacher.email,
      new Date(record.date).toLocaleDateString('id-ID'),
      record.clockIn.timestamp ? new Date(record.clockIn.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
      record.clockOut?.timestamp ? new Date(record.clockOut.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
      getStatusLabel(record.clockIn.status),
      record.clockOut ? getStatusLabel(record.clockOut.status) : '-',
      record.clockIn.note || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi-guru-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredRecords = records.filter(record => {
    if (selectedStatus !== 'all' && record.clockIn.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const statistics = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.clockIn.status === 'Present').length,
    absent: filteredRecords.filter(r => r.clockIn.status === 'Absent').length,
    leave: filteredRecords.filter(r => r.clockIn.status === 'Leave').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Manajemen Guru" description="Kelola data guru dan absensi" />
        <div className="flex justify-center items-center py-8">
          <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
        <FiArrowLeft className="h-4 w-4" />
        <span>Kembali ke Dasbor</span>
      </Link>

      <PageHeader 
        title="Manajemen Guru" 
        description="Kelola data guru dan absensi"
        actionButton={
          <button
            onClick={() => activeTab === 'teachers' ? fetchTeachers() : fetchAttendance()}
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'teachers'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Daftar Guru ({teachers.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'attendance'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Absensi ({records.length})
        </button>
      </div>

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Daftar Guru</h2>
            <button
              onClick={openAddModal}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Tambah Guru</span>
            </button>
          </div>

          {/* Teachers Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">ID: {teacher._id.substring(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTeacher(teacher._id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <FiMail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <FiPhone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{teacher.phone}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2">
                    Bergabung: {new Date(teacher.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {teachers.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600 font-medium">Belum ada data guru</p>
              <p className="text-gray-500 text-sm mt-1">Klik tombol Tambah Guru untuk menambahkan guru baru</p>
            </div>
          )}

          {/* Teachers Table View */}
          {teachers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Lengkap</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telepon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTeacher(teacher._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
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
              <button
                onClick={deleteAllAttendance}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center space-x-2"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Hapus Semua</span>
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
                    Jam Masuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Pulang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
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
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.clockIn.status)}`}>
                            {getStatusLabel(record.clockIn.status)}
                          </span>
                          {record.clockIn.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(record.clockIn.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {record.clockIn.note && (
                            <span className="text-xs text-gray-600 italic">
                              {record.clockIn.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.clockOut ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.clockOut.status)}`}>
                              {getStatusLabel(record.clockOut.status)}
                            </span>
                            {record.clockOut.timestamp && (
                              <span className="text-xs text-gray-500">
                                {new Date(record.clockOut.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {record.clockOut.note && (
                              <span className="text-xs text-gray-600 italic">
                                {record.clockOut.note}
                              </span>
                            )}
                            {record.clockOut.leavePhoto && (
                              <a 
                                href={record.clockOut.leavePhoto} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Lihat Foto
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteAttendanceRecord(record._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          title="Hapus data absensi"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data absensi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Teacher */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-purple">
                {editingTeacher ? 'Edit Guru' : 'Tambah Guru'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Guru
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingTeacher && '(Kosongkan jika tidak ingin diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingTeacher}
                  placeholder={editingTeacher ? 'Tidak wajib diisi' : 'Minimal 8 karakter'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving && <FiLoader className="animate-spin h-4 w-4" />}
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiLoader, FiX, FiCalendar } from 'react-icons/fi';

interface Curriculum {
  _id: string;
  title: string;
  description: string;
  grade: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
}

interface Schedule {
  _id: string;
  title: string;
  curriculum: {
    title: string;
  };
  day: string;
  startTime: string;
  endTime: string;
  teacher: {
    name: string;
  };
  location: string;
}

export default function CurriculumPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'schedule'>('curriculum');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Curriculum | Schedule | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurriculums();
    fetchSchedules();
  }, []);

  const fetchCurriculums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/curriculums', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCurriculums(data.curriculums);
      }
    } catch (err) {
      console.error('Failed to fetch curriculums:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (type: 'curriculum' | 'schedule') => {
    setActiveTab(type);
    setEditingItem(null);
    if (type === 'curriculum') {
      setFormData({
        title: '',
        description: '',
        grade: ''
      });
    } else {
      setFormData({
        title: '',
        curriculum: '',
        day: '',
        startTime: '',
        endTime: '',
        teacher: '',
        location: ''
      });
    }
    setShowModal(true);
  };

  const openEditModal = (item: Curriculum | Schedule, type: 'curriculum' | 'schedule') => {
    setActiveTab(type);
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
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

      const isCurriculum = activeTab === 'curriculum';
      const url = editingItem
        ? `http://localhost:3000/api/curriculums/${editingItem._id}`
        : `http://localhost:3000/api/curriculums`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to save ${activeTab}`);
      }

      if (isCurriculum) {
        await fetchCurriculums();
      } else {
        await fetchSchedules();
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string, type: 'curriculum' | 'schedule') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/${type === 'curriculum' ? 'curriculums' : type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to delete ${type}`);
      }

      if (type === 'curriculum') {
        setCurriculums(curriculums.filter(item => item._id !== id));
      } else {
        setSchedules(schedules.filter(item => item._id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-purple">Kurikulum Dan Jadwal</h1>
        <div className="flex justify-center items-center py-8">
          <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-purple">Kurikulum Dan Jadwal</h1>

      {/* Google Calendar Integration Placeholder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <FiCalendar className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">Google Calendar Integration</span>
        </div>
        <p className="text-blue-700 mt-1 text-sm">
          Integrasi dengan Google Calendar akan memungkinkan sinkronisasi jadwal secara otomatis.
          Fitur ini sedang dalam pengembangan.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'curriculum'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Kurikulum
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Jadwal
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab === 'curriculum' ? 'Daftar Kurikulum' : 'Daftar Jadwal'}
        </h2>
        <button
          onClick={() => openAddModal(activeTab)}
          className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
        >
          <FiPlus className="h-4 w-4" />
          <span>Tambah {activeTab === 'curriculum' ? 'Kurikulum' : 'Jadwal'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Curriculum Table */}
      {activeTab === 'curriculum' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {curriculums.map((curriculum) => (
                <tr key={curriculum._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {curriculum.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {curriculum.grade}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {curriculum.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(curriculum, 'curriculum')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(curriculum._id, 'curriculum')}
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
          {curriculums.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data kurikulum yang tersedia.
            </div>
          )}
        </div>
      )}

      {/* Schedule Table */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurikulum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.curriculum?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.teacher?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(schedule, 'schedule')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(schedule._id, 'schedule')}
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
          {schedules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data jadwal yang tersedia.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-purple">
                {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'curriculum' ? 'Kurikulum' : 'Jadwal'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'curriculum' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={formData.grade || ''}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kurikulum
                    </label>
                    <select
                      value={formData.curriculum || ''}
                      onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                      <option value="">Pilih Kurikulum</option>
                      {curriculums.map((curriculum) => (
                        <option key={curriculum._id} value={curriculum._id}>
                          {curriculum.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari
                    </label>
                    <select
                      value={formData.day || ''}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                      <option value="">Pilih Hari</option>
                      <option value="Monday">Senin</option>
                      <option value="Tuesday">Selasa</option>
                      <option value="Wednesday">Rabu</option>
                      <option value="Thursday">Kamis</option>
                      <option value="Friday">Jumat</option>
                      <option value="Saturday">Sabtu</option>
                      <option value="Sunday">Minggu</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Mulai
                      </label>
                      <input
                        type="time"
                        value={formData.startTime || ''}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={formData.endTime || ''}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guru
                    </label>
                    <input
                      type="text"
                      value={formData.teacher || ''}
                      onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                      placeholder="ID Guru"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>
                </>
              )}

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

      <Link href="/adminDashboard" className="text-sm text-brand-purple">← Back to Admin Dashboard</Link>
    </div>
  );
}

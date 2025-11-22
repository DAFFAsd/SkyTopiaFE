'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiLoader, FiX, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

interface Curriculum {
  _id: string;
  title: string;
  description: string;
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
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  teacher: {
    name: string;
    _id: string;
  };
  location: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

export default function CurriculumPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'schedule'>('curriculum');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Curriculum | Schedule | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Week view start date - today

  useEffect(() => {
    fetchCurriculums();
    fetchSchedules();
    fetchTeachers();
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

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching teachers with token...');
      const response = await fetch('http://localhost:3000/api/users?role=Teacher', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Teachers response status:', response.status);
      const data = await response.json();
      console.log('Teachers data:', data);
      
      if (response.ok && data.success) {
        console.log('Setting teachers:', data.users);
        setTeachers(data.users || []);
      } else {
        console.error('Failed to fetch teachers:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  // Calendar helper functions
  const getDaysInWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const startDate = new Date(d.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getSchedulesForDay = (date: Date) => {
    // Filter schedules by exact date match
    return schedules.filter(s => {
      if (!s.date) return false;
      const scheduleDate = new Date(s.date);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const getDayDate = (dayName: string): string => {
    const days = getDaysInWeek(currentDate);
    const dayIndex = dayNamesEn.indexOf(dayName);
    if (dayIndex === -1) return 'Pilih hari terlebih dahulu';
    const selectedDate = days[dayIndex];
    return selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDateDayName = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dayNamesEn[date.getDay()];
  };

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return 'Pilih tanggal';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const previousWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const nextWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const openAddModal = (type: 'curriculum' | 'schedule') => {
    setActiveTab(type);
    setEditingItem(null);
    if (type === 'curriculum') {
      setFormData({
        title: '',
        description: ''
      });
    } else {
      setFormData({
        title: '',
        curriculum: '',
        date: new Date().toISOString().split('T')[0], // Set default to today
        startTime: '',
        endTime: '',
        teacher: '',
        day: '' // Will be set based on date
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
      
      // Determine endpoint based on activeTab, not editingItem type
      let url: string;
      let method: string;
      
      if (isCurriculum) {
        url = editingItem
          ? `http://localhost:3000/api/curriculums/${editingItem._id}`
          : `http://localhost:3000/api/curriculums`;
        method = editingItem ? 'PUT' : 'POST';
      } else {
        url = editingItem
          ? `http://localhost:3000/api/schedules/${editingItem._id}`
          : `http://localhost:3000/api/schedules`;
        method = editingItem ? 'PUT' : 'POST';
      }

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
      <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
        <FiArrowLeft className="h-4 w-4" />
        <span>Kembali ke Dasbor</span>
      </Link>
      <h1 className="text-2xl font-bold text-brand-purple">Kurikulum Dan Jadwal</h1>

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

      {/* Schedule Calendar View */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
            {/* Calendar Header */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
              <button
                onClick={previousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiChevronLeft className="h-5 w-5 text-brand-purple" />
              </button>
              <div className="flex items-center gap-2 flex-1 justify-center">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {getDaysInWeek(currentDate)[0].toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {getDaysInWeek(currentDate)[6].toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap"
                >
                  Minggu Ini
                </button>
                <input
                  type="month"
                  value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>
              <button
                onClick={nextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiChevronRight className="h-5 w-5 text-brand-purple" />
              </button>
            </div>            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInWeek(currentDate).map((day, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden min-h-96">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white p-3">
                    <div className="text-sm font-semibold">{dayNames[day.getDay()]}</div>
                    <div className="text-2xl font-bold">{day.getDate()}</div>
                  </div>

                  {/* Day Content */}
                  <div className="p-3 bg-gray-50 h-80 overflow-y-auto space-y-2">
                    {getSchedulesForDay(day).length > 0 ? (
                      getSchedulesForDay(day).map((schedule) => (
                        <div
                          key={schedule._id}
                          className="bg-white p-2 rounded border-l-4 border-brand-purple hover:shadow-md transition group"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-brand-purple truncate">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {schedule.title}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {schedule.teacher?.name || 'Belum assign'}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                              <button
                                onClick={() => openEditModal(schedule, 'schedule')}
                                className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <FiEdit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteItem(schedule._id, 'schedule');
                                }}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <FiTrash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 text-xs py-20">
                        Tidak ada jadwal
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                  {/* Info Tanggal */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">
                      📅 Jadwal untuk: <span className="font-semibold">{formatDateDisplay(formData.date)}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const dayName = getDateDayName(newDate);
                        setFormData({ ...formData, date: newDate, day: dayName });
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

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
                    <select
                      value={formData.teacher || ''}
                      onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                      <option value="">Pilih Guru</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
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
    </div>
  );
}

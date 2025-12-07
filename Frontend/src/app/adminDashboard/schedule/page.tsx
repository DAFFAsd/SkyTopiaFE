'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiLoader, FiX, FiChevronLeft, FiChevronRight, FiArrowLeft, FiMessageSquare, FiSend } from 'react-icons/fi';
import PageHeader from '../../../components/PageHeader';
import ReactMarkdown from 'react-markdown';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function SchedulePage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurriculums();
    fetchSchedules();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingChat(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const url = chatThreadId 
        ? apiUrl(`/chatbot/${chatThreadId}/message`)
        : apiUrl('/chatbot/new');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.success) {
        if (!chatThreadId && data.thread_id) {
          setChatThreadId(data.thread_id);
        }

        // Fetch chat history to get the AI response
        const historyUrl = apiUrl(`/chatbot/history/${chatThreadId || data.thread_id}`);
        const historyResponse = await fetch(historyUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const historyData = await historyResponse.json();

        if (historyData.success) {
          setChatMessages(historyData.data.messages);
          // Refresh schedules after chatbot creates one
          await fetchSchedules();
        }
      } else {
        throw new Error(data.message || 'Gagal mengirim pesan');
      }
    } catch (err: unknown) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
    if (!showChatbot && chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: 'Halo Admin! Saya SkyBot, asisten penjadwalan Anda. Saya bisa membantu membuat jadwal dengan mudah.\n\n**Contoh perintah:**\n- "Buatkan jadwal Matematika hari Senin tanggal 2 Desember 2025 jam 09:00-10:00"\n- "Jadwalkan Bahasa Inggris untuk tanggal 5 Desember pukul 13:00-14:30"\n- "Buat jadwal Olahraga di Lapangan hari Rabu jam 10:00-11:00"'
      }]);
    }
  };

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

      const response = await fetch('http://localhost:3000/api/users?role=Teacher', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
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
    return schedules.filter(s => {
      if (!s.date) return false;
      const scheduleDate = new Date(s.date);
      return scheduleDate.toDateString() === date.toDateString();
    });
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

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      curriculum: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      teacher: '',
      day: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item: Schedule) => {
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

      const url = editingItem
        ? apiUrl(`/schedules/${editingItem._id}`)
        : apiUrl('/schedules');
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
        throw new Error(data.message || 'Failed to save schedule');
      }

      await fetchSchedules();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete schedule');
      }

      setSchedules(schedules.filter(item => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
          <FiArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dasbor</span>
        </Link>
        <PageHeader 
          title="Jadwal Kegiatan" 
          description="Kelola jadwal harian dan mingguan"
          actionButton={
            <button
              onClick={openAddModal}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Tambah Jadwal</span>
            </button>
          }
        />
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
      <PageHeader 
        title="Jadwal Kegiatan" 
        description="Kelola jadwal harian dan mingguan"
        actionButton={
          <div className="flex gap-2">
            <button
              onClick={toggleChatbot}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>AI Asisten</span>
            </button>
            <button
              onClick={openAddModal}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Tambah Manual</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Schedule Calendar View */}
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
          </div>

          {/* Calendar Grid */}
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
                              onClick={() => openEditModal(schedule)}
                              className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <FiEdit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(schedule._id);
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-purple">
                {editingItem ? 'Edit' : 'Tambah'} Jadwal
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-slide-up">
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiMessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">SkyBot - Asisten Jadwal</h3>
            </div>
            <button
              onClick={toggleChatbot}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isSendingChat && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik perintah untuk membuat jadwal..."
                disabled={isSendingChat}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="flex-shrink-0 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSendingChat ? (
                  <FiLoader className="h-5 w-5 animate-spin" />
                ) : (
                  <FiSend className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Contoh: &quot;Buatkan jadwal Matematika hari Senin jam 09:00-10:00&quot;
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

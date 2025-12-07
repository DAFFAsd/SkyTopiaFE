'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    FiArrowLeft, FiUser, FiLoader, FiCalendar, FiClock 
} from 'react-icons/fi';
import { apiUrl } from '@/lib/api';

// --- Tipe Data Lengkap (sesuai 'getChildById') ---
interface Parent {
    _id: string;
    name: string;
    email: string;
    phone: string;
}
interface ScheduleTeacher {
    _id: string;
    name: string;
    email: string;
}
interface ScheduleCurriculum {
    _id: string;
    title: string;
    description: string;
}
interface Schedule {
    _id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher: ScheduleTeacher;
    curriculum: ScheduleCurriculum;
}
interface ChildProfile {
    _id: string;
    name: string;
    birth_date: string;
    gender: string;
    parent_id: Parent;
    medical_notes: string;
    schedules: Schedule[];
}
// -------------------------------------------------

export default function ChildInfoPage() {
    const params = useParams();
    const id = params.id as string; // Ambil ID dari URL

    const [child, setChild] = useState<ChildProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (id) {
            const fetchChildInfo = async () => {
                setIsLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Token tidak ditemukan');

                    // Pake 'Shared Route' (udah bener)
                    const response = await fetch(apiUrl(`/children/${id}`), {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const data = await response.json();

                    if (data.success) {
                        setChild(data.child);
                    } else {
                        throw new Error(data.message || 'Gagal mengambil data anak');
                    }
                } catch (err: unknown) {
                    let errorMessage = "Terjadi kesalahan";
                    if (err instanceof Error) errorMessage = err.message;
                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchChildInfo();
        }
    }, [id]);

    const InfoRow = ({ label, value }: { label: string, value: string | undefined }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || '-'}</dd>
        </div>
    );

    const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
        <div className="rounded-lg border border-brand-purple/30 p-4 bg-white">
            <h4 className="font-semibold text-brand-purple">{schedule.title}</h4>
            <p className="text-sm text-gray-600">{schedule.curriculum.title}</p>
            <div className="mt-2 text-sm space-y-1">
                <p className="flex items-center"><FiCalendar className="h-4 w-4 mr-2 text-login-pink" /> {schedule.day}</p>
                <p className="flex items-center"><FiClock className="h-4 w-4 mr-2 text-login-pink" /> {schedule.startTime} - {schedule.endTime}</p>
                <p className="flex items-center"><FiUser className="h-4 w-4 mr-2 text-login-pink" /> {schedule.teacher.name}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Link
                href="/teacherDashboard/my-class" // Balik ke Halaman List
                className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
            >
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Daftar Anak</span>
            </Link>

            {isLoading ? (
                <div className="text-center text-gray-500 p-10">
                    <FiLoader className="h-10 w-10 mx-auto animate-spin text-brand-purple" />
                    Memuat profil anak...
                </div>
            ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
            ) : child ? (
                <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                    {/* --- Header Profil --- */}
                    <div className="p-6 bg-stat-pink-bg flex flex-col md:flex-row items-center gap-6">
                        <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
                            <FiUser className="h-20 w-20 text-login-pink" />
                        </div>
                        <div>
                            <h1 className="font-rammetto text-3xl font-bold text-brand-purple">
                                {child.name}
                            </h1>
                            <p className="text-gray-600">
                                Lahir: {new Date(child.birth_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </p>
                            <p className="text-gray-600">Gender: {child.gender}</p>
                        </div>
                    </div>
                    
                    {/* --- Navigasi Tab --- */}
                    <div className="border-b border-gray-200 px-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`py-4 px-1 border-b-2 text-sm font-medium
                                    ${activeTab === 'info' 
                                        ? 'border-login-pink text-login-pink' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                Informasi Anak
                            </button>
                            <button
                                onClick={() => setActiveTab('parent')}
                                className={`py-4 px-1 border-b-2 text-sm font-medium
                                    ${activeTab === 'parent' 
                                        ? 'border-login-pink text-login-pink' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                Detail Orang Tua
                            </button>
                            <button
                                onClick={() => setActiveTab('schedules')}
                                className={`py-4 px-1 border-b-2 text-sm font-medium
                                    ${activeTab === 'schedules' 
                                        ? 'border-login-pink text-login-pink' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                Jadwal Anak
                            </button>
                        </nav>
                    </div>

                    {/* --- Konten Tab --- */}
                    <div className="p-6">
                        {/* Tab 1: Info Anak */}
                        <div className={activeTab === 'info' ? 'block' : 'hidden'}>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Nama Lengkap" value={child.name} />
                                <InfoRow label="Tanggal Lahir" value={new Date(child.birth_date).toLocaleDateString('id-ID', { dateStyle: 'long' })} />
                                <InfoRow label="Gender" value={child.gender} />
                                <InfoRow label="Catatan Medis" value={child.medical_notes} />
                            </dl>
                        </div>
                        
                        {/* Tab 2: Info Ortu */}
                        <div className={activeTab === 'parent' ? 'block' : 'hidden'}>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Nama Orang Tua" value={child.parent_id.name} />
                                <InfoRow label="Email" value={child.parent_id.email} />
                                <InfoRow label="No. Telepon" value={child.parent_id.phone} />
                            </dl>
                        </div>

                        {/* Tab 3: Jadwal */}
                        <div className={activeTab === 'schedules' ? 'block' : 'hidden'}>
                            {child.schedules.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {child.schedules.map(sch => (
                                        <ScheduleCard key={sch._id} schedule={sch} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">Anak ini belum punya jadwal.</p>
                            )}
                        </div>
                    </div>

                </div>
            ) : null}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// --- (1) TAMBAHIN FiUser ---
import { 
    FiClipboard, FiBookOpen, FiCheckSquare, FiArchive, 
    FiAlertTriangle, FiCalendar, FiUser 
} from 'react-icons/fi';
import { IconType } from 'react-icons'; // Import IconType biar rapi

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// (2) KOMPONEN TaskCard (Icon-nya dibenerin tipenya)
function TaskCard({ title, href, icon: Icon, color }: { title: string; href: string; icon: IconType; color: string }) {
    return (
        <Link
        href={href}
        className={`flex h-32 items-center space-x-4 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-[1.03] ${color}`}
        >
        <Icon className="h-8 w-8 text-brand-purple" />
        <span className="text-lg font-semibold text-brand-purple">{title}</span>
        </Link>
    );
}

export default function TeacherDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
        setUser(JSON.parse(userString));
        }
    }, []);

    return (
        <div className="space-y-8">
            {/* --- (3) BANNER WELCOME (Font diganti) --- */}
            <div className="relative rounded-xl shadow-sm border border-yellow-200 bg-welcome-yellow p-8 overflow-hidden">
                <div className="max-w-md">
                    {/* Pake font-rammetto biar lucu */}
                    <h3 className="font-bold text-3xl text-brand-purple">
                        Halo, {user?.name || 'Guru'}!
                    </h3>
                    <p className="mt-2 text-brand-purple/90">
                        Selamat datang di dasbor guru. Silakan pilih tugas yang ingin Anda lakukan.
                    </p>
                </div>
                <div className="absolute right-10 -bottom-8 hidden lg:block opacity-80">
                    <Image
                        src="/woman-at-desk.svg"
                        alt="Ilustrasi"
                        width={200} // Dibikin lebih gede dikit
                        height={130}
                    />
                </div>
            </div>

            <div>
                {/* --- (4) JUDUL (Font diganti) --- */}
                <h3 className="font-rammetto text-2xl font-bold text-brand-purple mb-4">
                    Tugas Utama
                </h3>
                
                {/* --- (5) DAFTAR KARTU (Ditambahin 'Anak Didik' & ganti warna) --- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* (BARU) Tombol Anak Didik Saya */}
                    <TaskCard
                        title="Anak Didik Saya"
                        href="/teacherDashboard/my-class"
                        icon={FiUser}
                        color="bg-stat-pink-bg" // Pink
                    />
                    
                    <TaskCard
                        title="Buat Laporan Harian"
                        href="/teacherDashboard/daily-report"
                        icon={FiClipboard}
                        color="bg-stat-blue-bg/50" // Biru
                    />
                    <TaskCard
                        title="Buat Laporan Semester"
                        href="/teacherDashboard/semester-report"
                        icon={FiBookOpen}
                        color="bg-stat-pink-bg" // Pink
                    />
                    <TaskCard
                        title="Catat Absensi"
                        href="/teacherDashboard/attendance"
                        icon={FiCheckSquare}
                        color="bg-stat-blue-bg/50" // Biru
                    />
                    <TaskCard
                        title="Lihat Jadwal"
                        href="/teacherDashboard/schedules"
                        icon={FiCalendar}
                        color="bg-stat-pink-bg" // Pink
                    />
                    <TaskCard
                        title="Request Inventaris"
                        href="/teacherDashboard/inventory-request"
                        icon={FiArchive}
                        color="bg-stat-blue-bg/50" // Biru
                    />
                    <TaskCard
                        title="Lapor Fasilitas"
                        href="/teacherDashboard/facility-report"
                        icon={FiAlertTriangle}
                        color="bg-stat-pink-bg" // Pink
                    />
                </div>
            </div>
        </div>
    );
}
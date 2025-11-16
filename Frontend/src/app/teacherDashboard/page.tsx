'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiClipboard, FiBookOpen, FiCheckSquare, FiArchive, FiAlertTriangle, FiCalendar } from 'react-icons/fi';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    };

    function TaskCard({ title, href, icon: Icon, color }: { title: string; href: string; icon: any; color: string }) {
    return (
        <Link
        href={href}
        className={`flex h-32 items-center space-x-4 rounded-lg p-6 transition-transform hover:scale-105 ${color}`}
        >
        <Icon className="h-8 w-8" />
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
        <div className="relative rounded-lg bg-welcome-yellow p-8">
            <div className="max-w-md">
            <h3 className="text-2xl font-semibold text-brand-purple ml-5">
                Halo, {user?.name || 'Guru'}!
            </h3>
            <p className="mt-2 text-brand-purple ml-5">
                Selamat datang di dasbor guru. Silakan pilih tugas yang ingin Anda lakukan.
            </p>
            </div>
            <div className="absolute right-20 top-3 bottom-0 hidden lg:block">
            <Image
                src="/woman-at-desk.svg"
                alt="Ilustrasi"
                width={150}
                height={100}
            />
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold text-brand-purple mb-4">Tugas Utama</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TaskCard
                title="Buat Laporan Harian"
                href="/teacherDashboard/daily-report"
                icon={FiClipboard}
                color="bg-stat-pink-bg"
            />
            <TaskCard
                title="Buat Laporan Semester"
                href="/teacherDashboard/semester-report"
                icon={FiBookOpen}
                color="bg-stat-blue-bg/50"
            />
            <TaskCard
                title="Catat Absensi"
                href="/teacherDashboard/attendance"
                icon={FiCheckSquare}
                color="bg-stat-pink-bg"
            />
            <TaskCard
                title="Lihat Jadwal"
                href="/teacherDashboard/schedules"
                icon={FiCalendar}
                color="bg-stat-blue-bg/50"
            />
            <TaskCard
                title="Request Inventaris"
                href="/teacherDashboard/inventory-request"
                icon={FiArchive}
                color="bg-stat-pink-bg"
            />
            <TaskCard
                title="Lapor Fasilitas"
                href="/teacherDashboard/facility-report"
                icon={FiAlertTriangle}
                color="bg-stat-blue-bg/50"
            />
            </div>
        </div>
        </div>
    );
}
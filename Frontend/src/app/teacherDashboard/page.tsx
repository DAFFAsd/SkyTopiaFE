'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { 
    FiClipboard, FiBookOpen, FiCheckSquare, FiArchive, FiAlertTriangle, FiCalendar,
    FiUsers, FiFileText
} from 'react-icons/fi';

interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: string;
    assignedTeacher?: unknown; 
}

interface DashboardStats {
    totalChildren: number;
    totalAssignedChildren: number;
    todayAttendance: number;
    completedReports: number;
}

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// Card component for functional groups
function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="font-rammetto text-xl text-brand-purple mb-4 pb-2 border-b-2 border-login-pink/20">
                {title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children}
            </div>
        </div>
    );
}

// Button component for navigation items
function DashboardButton({ 
    title, 
    href, 
    icon: Icon, 
    description,
    variant = 'default'
}: { 
    title: string; 
    href: string; 
    icon: IconType; 
    description?: string;
    variant?: 'default' | 'pink';
}) {
    const bgColor = variant === 'pink' 
        ? 'from-stat-pink-bg/30 to-login-pink/20 hover:from-stat-pink-bg/50 hover:to-login-pink/30' 
        : 'from-stat-blue-bg/30 to-stat-pink-bg/30 hover:from-stat-blue-bg/50 hover:to-stat-pink-bg/50';

    return (
        <Link 
            href={href}
            className={`group flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-br ${bgColor} transition-all hover:scale-[1.02] border border-transparent hover:border-brand-purple/20`}
        >
            <div className="flex-shrink-0 mt-1">
                <Icon className="h-5 w-5 text-brand-purple group-hover:text-login-pink transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-purple group-hover:text-login-pink transition-colors">
                    {title}
                </p>
                {description && (
                    <p className="text-xs text-gray-600 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </Link>
    );
}

// Horizontal Statistics Card Component
function StatCard({ 
    icon: Icon, 
    value, 
    label, 
    iconBgColor, 
    iconColor 
}: { 
    icon: IconType; 
    value: number | string; 
    label: string; 
    iconBgColor: string; 
    iconColor: string; 
}) {
    return (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
                {/* Left: Icon */}
                <div className={`flex-shrink-0 ${iconBgColor} rounded-full p-2`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                
                {/* Right: Value and Label */}
                <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-brand-purple">
                        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function TeacherDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalChildren: 0,
        totalAssignedChildren: 0,
        todayAttendance: 0,
        completedReports: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Ambil data user dari localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
            setUser(JSON.parse(userString));
        }
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Try to fetch from backend endpoint first
            try {
                const response = await fetch('http://localhost:3000/api/users/dashboard/stats', { 
                    headers 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.stats) {
                        const childrenStats = data.stats.children || {};
                        const attendanceStats = data.stats.attendance || {};
                        const reportsStats = data.stats.reports?.daily || {};

                        const totalChildren = childrenStats.total || 0;
                        const totalAssignedChildren = childrenStats.assignedToTeacher || 0;
                        const todayAttendance = attendanceStats.today || 0;
                        const completedReports = reportsStats.completed || 0;

                        setStats({
                            totalChildren,
                            totalAssignedChildren,
                            todayAttendance,
                            completedReports
                        });

                        setLoading(false);
                        return;
                    }
                }
            } catch {
                console.log('Dashboard stats endpoint not available, fetching individual endpoints...');
            }

            // Fallback: Fetch from individual endpoints
            const [childrenRes, attendanceRes] = await Promise.all([
                fetch('http://localhost:3000/api/children', { headers }),
                fetch('http://localhost:3000/api/attendance', { headers })
            ]);

            const reportsRes = await fetch('http://localhost:3000/api/daily-reports', { headers });

            // Check response status
            if (!childrenRes.ok) throw new Error('Failed to fetch children data');
            if (!attendanceRes.ok) throw new Error('Failed to fetch attendance data');
            if (!reportsRes.ok) throw new Error('Failed to fetch reports data');

            const childrenData = await childrenRes.json();
            const attendanceData = await attendanceRes.json();
            const reportsData = await reportsRes.json();

            // Calculate statistics - handle different response formats
            let childrenArray = [];
            if (Array.isArray(childrenData)) {
                childrenArray = childrenData;
            } else if (childrenData.children && Array.isArray(childrenData.children)) {
                childrenArray = childrenData.children;
            } else if (childrenData.data && Array.isArray(childrenData.data)) {
                childrenArray = childrenData.data;
            }
            const totalChildren = childrenArray.length;
            const totalAssignedChildren = childrenArray.filter((c: Child) => c && c.assignedTeacher).length;

            // Get attendance for today
            let attendanceArray = [];
            if (Array.isArray(attendanceData)) {
                attendanceArray = attendanceData;
            } else if (attendanceData.attendance && Array.isArray(attendanceData.attendance)) {
                attendanceArray = attendanceData.attendance;
            } else if (attendanceData.data && Array.isArray(attendanceData.data)) {
                attendanceArray = attendanceData.data;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayAttendance = attendanceArray.filter((att: { date: string }) => {
                if (!att || !att.date) return false;
                const attDate = new Date(att.date);
                return attDate >= today && attDate < tomorrow;
            }).length;

            // Get reports
            let reportsArray = [];
            if (Array.isArray(reportsData)) {
                reportsArray = reportsData;
            } else if (reportsData.reports && Array.isArray(reportsData.reports)) {
                reportsArray = reportsData.reports;
            } else if (reportsData.data && Array.isArray(reportsData.data)) {
                reportsArray = reportsData.data;
            }
            const completedReports = reportsArray.filter((r: { status: string }) => r && r.status === 'Completed').length;

            setStats({
                totalChildren,
                totalAssignedChildren,
                todayAttendance,
                completedReports
            });

        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat statistik dashboard';
            setError(errorMessage);
            
            // Set to 0 on error
            setStats({
                totalChildren: 0,
                totalAssignedChildren: 0,
                todayAttendance: 0,
                completedReports: 0
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative rounded-xl bg-gradient-to-r from-welcome-yellow via-stat-pink-bg/30 to-stat-blue-bg/30 p-5 shadow-md border border-brand-purple/10 overflow-hidden">
                <div className="relative z-10">
                    <h1 className="font-rammetto text-2xl text-brand-purple mb-2">
                        Halo, {user?.name || 'Guru'}! 👋
                    </h1>
                    <p className="text-gray-700 text-base max-w-2xl">
                        Selamat datang di Dashboard Guru SkyTopia. Kelola tugas pembelajaran dan kelas Anda dengan efisien.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-login-pink/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Stats Section */}
            <div className="bg-gradient-to-br from-brand-purple/5 to-login-pink/5 rounded-xl p-6 border border-brand-purple/10">
                <h3 className="font-rammetto text-lg text-brand-purple mb-4">
                    Ringkasan Statistik
                </h3>
                
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                        <p className="text-sm text-gray-600 mt-2">Memuat data statistik...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={FiUsers}
                            value={stats.totalChildren}
                            label="Total Anak Didik"
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            icon={FiUsers}
                            value={stats.totalAssignedChildren}
                            label="Anak Didik Saya"
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <StatCard
                            icon={FiCheckSquare}
                            value={stats.todayAttendance}
                            label="Absensi Hari Ini"
                            iconBgColor="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                        <StatCard
                            icon={FiFileText}
                            value={stats.completedReports}
                            label="Laporan Selesai"
                            iconBgColor="bg-yellow-100"
                            iconColor="text-yellow-600"
                        />
                    </div>
                )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Laporan & Dokumentasi */}
                <DashboardCard title="Laporan & Dokumentasi">
                    <DashboardButton
                        title="Buat Laporan Harian"
                        href="/teacherDashboard/daily-report"
                        icon={FiClipboard}
                        description="Catat aktivitas harian kelas"
                    />
                    <DashboardButton
                        title="Buat Laporan Semester"
                        href="/teacherDashboard/semester-report"
                        icon={FiBookOpen}
                        description="Buat laporan perkembangan semester"
                    />
                </DashboardCard>

                {/* 2. Kehadiran & Jadwal */}
                <DashboardCard title="Kehadiran & Jadwal">
                    <DashboardButton
                        title="Catat Absensi"
                        href="/teacherDashboard/attendance"
                        icon={FiCheckSquare}
                        description="Catat kehadiran anak didik"
                        variant="pink"
                    />
                    <DashboardButton
                        title="Lihat Jadwal"
                        href="/teacherDashboard/schedules"
                        icon={FiCalendar}
                        description="Cek jadwal kelas & aktivitas"
                        variant="pink"
                    />
                </DashboardCard>

                {/* 3. Permintaan & Laporan Fasilitas */}
                <DashboardCard title="Permintaan & Fasilitas">
                    <DashboardButton
                        title="Request Inventaris"
                        href="/teacherDashboard/inventory-request"
                        icon={FiArchive}
                        description="Ajukan permintaan barang"
                    />
                    <DashboardButton
                        title="Lapor Fasilitas"
                        href="/teacherDashboard/facility-report"
                        icon={FiAlertTriangle}
                        description="Laporkan kondisi fasilitas"
                    />
                </DashboardCard>

            </div>
        </div>
    );
}
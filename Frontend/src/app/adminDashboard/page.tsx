'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FiUsers, FiDatabase, FiCalendar, FiFileText, FiBarChart, 
    FiPackage, FiAlertTriangle, FiDollarSign, FiUser
} from 'react-icons/fi';
interface DashboardStats {
    totalChildren: number;
    totalTeachers: number;
    totalParents: number;
    totalUsers: number;
    todayReports: number;
    pendingRequests: number;
}

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
    icon: any; 
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
    icon: any; 
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

export default function DashboardAdminPage() {
    const API = '/api';
    const [stats, setStats] = useState<DashboardStats>({
        totalChildren: 0,
        totalTeachers: 0,
        totalParents: 0,
        totalUsers: 0,
        todayReports: 0,
        pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const isToday = (dateInput: any) => {
        if (!dateInput) return false;
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return false;
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(start); end.setDate(end.getDate() + 1);
        return d >= start && d < end;
    };

    const toArray = (data: any, keys: string[]): any[] => {
        if (Array.isArray(data)) return data;
        for (const k of keys) {
            if (data && Array.isArray(data[k])) return data[k];
        }
        return [];
    };

    const fetchJson = async (url: string, headers: Record<string, string>) => {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed request: ${url}`);
        return res.json();
    };

    const fetchJsonWithFallback = async (urls: string[], headers: Record<string, string>) => {
        for (const url of urls) {
            try {
                const res = await fetch(url, { headers });
                if (res.ok) return await res.json();
            } catch {
                // try next
            }
        }
        return { data: [] };
    };

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
                const response = await fetch(`${API}/users/dashboard/stats`, { 
                    headers 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.stats) {
                        const usersStats = data.stats.users || {};
                        const reportsStats = data.stats.reports?.daily || {};

                        const totalChildren = usersStats.totalChildren || 0;
                        const totalTeachers = usersStats.totalTeachers || 0;
                        const totalParents = usersStats.totalParents || 0;
                        const totalAdmins = usersStats.totalAdmins || 0;
                        const totalUsers = totalTeachers + totalParents + totalAdmins;
                        const todayReports = reportsStats.today || 0;

                        // First set the available stats from dashboard endpoint
                        setStats(prev => ({
                            ...prev,
                            totalChildren,
                            totalTeachers,
                            totalParents,
                            totalUsers,
                            todayReports
                        }));

                        // Fetch pending requests separately (not included in dashboard stats)
                        try {
                            const requestsData = await fetchJsonWithFallback([
                                `${API}/inventory-requests`,
                                `${API}/inventory/requests`
                            ], headers);
                            const requestsArray = toArray(requestsData, ['requests', 'data']);
                            const pendingRequests = requestsArray.filter((r: any) => r && (r.status === 'Pending' || r.status === 'pending')).length;
                            setStats(prev => ({ ...prev, pendingRequests }));
                        } catch (e) {
                            console.warn('Failed to fetch inventory requests for pending count');
                        }

                        setLoading(false);
                        return;
                    }
                }
            } catch (apiError) {
                console.log('Dashboard stats endpoint not available, fetching individual endpoints...');
            }

            // Fallback: Fetch from individual endpoints concurrently with resilience
            const results = await Promise.allSettled([
                fetch(`${API}/children`, { headers }),
                fetch(`${API}/users`, { headers }),
                fetchJsonWithFallback([
                    `${API}/inventory-requests`,
                    `${API}/inventory/requests`
                ], headers),
                fetch(`${API}/daily-reports`, { headers })
            ]);

            const [childrenResSet, usersResSet, requestsDataSet, reportsResSet] = results;

            const getOkResponse = (resSet: PromiseSettledResult<Response>) => {
                if (resSet.status === 'fulfilled' && resSet.value && (resSet.value as any).ok) return resSet.value as Response;
                return null;
            };

            const childrenResOk = getOkResponse(childrenResSet as PromiseSettledResult<Response>);
            const usersResOk = getOkResponse(usersResSet as PromiseSettledResult<Response>);
            const reportsResOk = getOkResponse(reportsResSet as PromiseSettledResult<Response>);

            const readJsonSafe = async (res: Response | null) => {
                try { return res ? await res.json() : null; } catch { return null; }
            };

            const childrenData = await readJsonSafe(childrenResOk);
            const usersData = await readJsonSafe(usersResOk);
            const reportsData = await readJsonSafe(reportsResOk);
            const requestsData = (requestsDataSet.status === 'fulfilled') ? (requestsDataSet.value as any) : null;

            console.log('Children Data:', childrenData);
            console.log('Users Data:', usersData);
            console.log('Reports Data:', reportsData);
            console.log('Requests Data:', requestsData);

            // Calculate statistics - handle different response formats
            let childrenArray = [] as any[];
            if (Array.isArray(childrenData)) {
                childrenArray = childrenData;
            } else if (childrenData?.children && Array.isArray(childrenData.children)) {
                childrenArray = childrenData.children;
            } else if (childrenData?.data && Array.isArray(childrenData.data)) {
                childrenArray = childrenData.data;
            }
            const totalChildren = childrenArray.length;

            // Get users array
            let usersArray = [] as any[];
            if (Array.isArray(usersData)) {
                usersArray = usersData;
            } else if (usersData?.users && Array.isArray(usersData.users)) {
                usersArray = usersData.users;
            } else if (usersData?.data && Array.isArray(usersData.data)) {
                usersArray = usersData.data;
            }
            // Count users by role
            const totalTeachers = usersArray.filter((u: any) => u && u.role === 'Teacher').length;
            const totalParents = usersArray.filter((u: any) => u && u.role === 'Parent').length;
            const totalUsers = usersArray.length;
            
            // Get reports array and count today's reports (from consolidated or daily endpoint)
            let reportsArray = [] as any[];
            if (Array.isArray(reportsData)) {
                reportsArray = reportsData;
            } else if (reportsData?.reports && Array.isArray(reportsData.reports)) {
                reportsArray = reportsData.reports;
            } else if (reportsData?.data && Array.isArray(reportsData.data)) {
                reportsArray = reportsData.data;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayReports = reportsArray.filter((report: any) => {
                if (!report || !report.date) return false;
                const reportDate = new Date(report.date);
                return reportDate >= today && reportDate < tomorrow;
            }).length;

            // Get requests array and count pending requests
            let requestsArray = [] as any[];
            if (Array.isArray(requestsData)) {
                requestsArray = requestsData;
            } else if (requestsData?.requests && Array.isArray(requestsData.requests)) {
                requestsArray = requestsData.requests;
            } else if (requestsData?.data && Array.isArray(requestsData.data)) {
                requestsArray = requestsData.data;
            }
            const pendingRequests = requestsArray.filter((req: any) => 
                req && (req.status === 'Pending' || req.status === 'pending')
            ).length;

            const hadForbidden = [childrenResSet, usersResSet, reportsResSet]
                .some(r => (r as any)?.status === 'fulfilled' && (r as any)?.value && !(r as any).value.ok && (r as any).value.status === 403);
            if (hadForbidden) {
                setError(prev => prev ?? 'Beberapa data tidak dapat diakses (403). Menampilkan statistik parsial.');
            }

            console.log('Calculated Stats:', {
                totalChildren,
                totalTeachers,
                totalParents,
                totalUsers,
                todayReports,
                pendingRequests
            });

            setStats({
                totalChildren,
                totalTeachers,
                totalParents,
                totalUsers,
                todayReports,
                pendingRequests
            });

        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat statistik dashboard';
            setError(errorMessage);
            
            // Set to 0 on error
            setStats({
                totalChildren: 0,
                totalTeachers: 0,
                totalParents: 0,
                totalUsers: 0,
                todayReports: 0,
                pendingRequests: 0
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
                        Halo, Admin! 👋
                    </h1>
                    <p className="text-gray-700 text-base max-w-2xl">
                        Selamat datang di Dashboard Admin SkyTopia. Kelola semua aspek daycare dengan mudah dan efisien.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-login-pink/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Stats Section - REFACTORED WITH HORIZONTAL LAYOUT */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <StatCard
                            icon={FiUsers}
                            value={stats.totalChildren}
                            label="Jumlah Anak Didik"
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            icon={FiUser}
                            value={stats.totalTeachers}
                            label="Jumlah Guru"
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <StatCard
                            icon={FiUsers}
                            value={stats.totalParents}
                            label="Jumlah Orang Tua"
                            iconBgColor="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                        <StatCard
                            icon={FiDatabase}
                            value={stats.totalUsers}
                            label="Total Pengguna"
                            iconBgColor="bg-login-pink/20"
                            iconColor="text-login-pink"
                        />
                        <StatCard
                            icon={FiFileText}
                            value={stats.todayReports}
                            label="Laporan Hari Ini"
                            iconBgColor="bg-yellow-100"
                            iconColor="text-yellow-600"
                        />
                        <StatCard
                            icon={FiPackage}
                            value={stats.pendingRequests}
                            label="Permintaan Menunggu"
                            iconBgColor="bg-red-100"
                            iconColor="text-red-600"
                        />
                    </div>
                )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Master Data Management */}
                <DashboardCard title="Pengelolaan Data Utama">
                    <DashboardButton
                        title="Informasi Anak"
                        href="/adminDashboard/children"
                        icon={FiUsers}
                        description="Kelola data anak didik"
                    />
                    <DashboardButton
                        title="Manajemen Pengguna"
                        href="/adminDashboard/users"
                        icon={FiUsers}
                        description="Kelola akun Guru & Orang Tua"
                    />
                    <DashboardButton
                        title="Database Guru"
                        href="/adminDashboard/database"
                        icon={FiDatabase}
                        description="Informasi detail guru"
                    />
                    <DashboardButton
                        title="Kurikulum & Jadwal"
                        href="/adminDashboard/curriculum"
                        icon={FiCalendar}
                        description="Atur kurikulum & jadwal"
                    />
                </DashboardCard>

                {/* 2. Inventory & Facilities */}
                <DashboardCard title="Inventaris & Fasilitas">
                    <DashboardButton
                        title="Permintaan Inventaris"
                        href="/adminDashboard/requests"
                        icon={FiPackage}
                        description="Setujui permintaan guru"
                        variant="pink"
                    />
                    <DashboardButton
                        title="Laporan Inventaris"
                        href="/adminDashboard/inventory-reports"
                        icon={FiBarChart}
                        description="Analisis permintaan"
                        variant="pink"
                    />
                    <DashboardButton
                        title="Kondisi Fasilitas"
                        href="/adminDashboard/facility-report"
                        icon={FiAlertTriangle}
                        description="Laporan kondisi fasilitas"
                        variant="pink"
                    />
                </DashboardCard>

                {/* 3. Reports & Analytics */}
                <DashboardCard title="Laporan & Analisis">
                    <DashboardButton
                        title="Semua Laporan"
                        href="/adminDashboard/reports"
                        icon={FiFileText}
                        description="Pantau aktivitas, perkembangan, dan kebahagiaan anak, termasuk laporan harian & semester."
                        variant="pink"
                    />
                </DashboardCard>

                {/* 4. Financials */}
                <DashboardCard title="Keuangan">
                    <DashboardButton
                        title="Manajemen Tagihan"
                        href="/adminDashboard/billing"
                        icon={FiDollarSign}
                        description="Kelola pembayaran"
                    />
                </DashboardCard>

            </div>
        </div>
    );
}
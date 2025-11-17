// Centralized Report Viewer Page - Admin Dashboard
'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiCalendar } from 'react-icons/fi';
import { DailyReport, SemesterReport } from '../types/report.types';
import { Child } from '../types/child.types';
import { getAllDailyReports, getAllSemesterReports } from '../services/reportService';
import { getAllChildren } from '../services/childService';
import DailyReportsTab from '../components/DailyReportsTab';
import SemesterReportsTab from '../components/SemesterReportsTab';

type TabType = 'daily' | 'semester';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('daily');
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
    const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoadingDaily, setIsLoadingDaily] = useState(true);
    const [isLoadingSemester, setIsLoadingSemester] = useState(true);
    const [isLoadingChildren, setIsLoadingChildren] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchDailyReports(),
            fetchSemesterReports(),
            fetchChildren()
        ]);
    };

    const fetchDailyReports = async () => {
        setIsLoadingDaily(true);
        setError(null);
        try {
            const data = await getAllDailyReports();
            setDailyReports(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat laporan harian';
            setError(errorMessage);
        } finally {
            setIsLoadingDaily(false);
        }
    };

    const fetchSemesterReports = async () => {
        setIsLoadingSemester(true);
        setError(null);
        try {
            const data = await getAllSemesterReports();
            setSemesterReports(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat laporan semester';
            setError(errorMessage);
        } finally {
            setIsLoadingSemester(false);
        }
    };

    const fetchChildren = async () => {
        setIsLoadingChildren(true);
        try {
            const data = await getAllChildren();
            setChildren(data);
        } catch (err) {
            console.error('Error fetching children:', err);
        } finally {
            setIsLoadingChildren(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    if (error && (isLoadingDaily || isLoadingSemester)) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchAllData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-brand-purple">Laporan Perkembangan Anak</h1>
                <p className="text-gray-600 mt-1">Lihat dan kelola laporan harian dan semester untuk semua anak</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FiFileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Laporan Harian</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoadingDaily ? '...' : dailyReports.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <FiCalendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Laporan Semester</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoadingSemester ? '...' : semesterReports.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <FiFileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Anak Terdaftar</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoadingChildren ? '...' : children.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-4 px-6">
                        <button
                            onClick={() => handleTabChange('daily')}
                            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'daily'
                                    ? 'border-brand-purple text-brand-purple'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <FiFileText className="h-5 w-5" />
                                <span>Laporan Harian</span>
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {dailyReports.length}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('semester')}
                            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'semester'
                                    ? 'border-brand-purple text-brand-purple'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <FiCalendar className="h-5 w-5" />
                                <span>Laporan Semester</span>
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {semesterReports.length}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'daily' ? (
                        <DailyReportsTab
                            reports={dailyReports}
                            children={children}
                            isLoading={isLoadingDaily || isLoadingChildren}
                        />
                    ) : (
                        <SemesterReportsTab
                            reports={semesterReports}
                            children={children}
                            isLoading={isLoadingSemester || isLoadingChildren}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

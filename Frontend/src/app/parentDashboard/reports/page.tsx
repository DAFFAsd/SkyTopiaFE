'use client';

import { useState } from 'react';
import { FiClipboard, FiFileText } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import DailyReportsTab from './DailyReportsTab';
import SemesterReportsTab from './SemesterReportsTab';

type ReportTab = 'daily' | 'semester';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('daily');

    const tabs = [
        { id: 'daily' as ReportTab, name: 'Laporan Harian', icon: FiClipboard },
        { id: 'semester' as ReportTab, name: 'Laporan Semester', icon: FiFileText },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Laporan" />

            {/* Tab Navigation */}
            <div className="rounded-lg bg-white p-2 shadow-sm">
                <div className="flex space-x-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-active-pink text-active-pink-text'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'daily' && <DailyReportsTab />}
                {activeTab === 'semester' && <SemesterReportsTab />}
            </div>
        </div>
    );
}

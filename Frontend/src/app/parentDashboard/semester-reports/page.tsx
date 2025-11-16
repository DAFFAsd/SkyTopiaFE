'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiArrowLeft, FiBookOpen, FiCheck, FiX, FiMinus, FiStar, FiHeart,
    FiCpu, FiMessageCircle, FiActivity, FiEdit2, FiShield, FiPenTool
} from 'react-icons/fi';

interface Child {
    _id: string;
    name: string;
}
interface Teacher {
    _id: string;
    name: string;
}
type ChecklistItem = {
    [key: string]: 'Konsisten' | 'Belum Konsisten' | 'Tidak Teramati';
};
interface SemesterReport {
    _id: string;
    child_id: Child;
    teacher_id: Teacher;
    semester: string;
    religious_moral: ChecklistItem;
    social_emotional: ChecklistItem;
    cognitive: ChecklistItem;
    language: ChecklistItem;
    gross_motor: ChecklistItem;
    fine_motor: ChecklistItem;
    independence: ChecklistItem;
    art: ChecklistItem;
    teacher_notes?: string;
    createdAt: string;
}

const reportSections = [
    { id: 'religious', title: 'Nilai Agama & Moral', icon: FiStar, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
    { id: 'social', title: 'Sosial Emosional', icon: FiHeart, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
    { id: 'cognitive', title: 'Kognitif', icon: FiCpu, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
    { id: 'language', title: 'Bahasa', icon: FiMessageCircle, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
    { id: 'gross-motor', title: 'Motorik Kasar', icon: FiActivity, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
    { id: 'fine-motor', title: 'Motorik Halus', icon: FiEdit2, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
    { id: 'independence', title: 'Kemandirian', icon: FiShield, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500' },
    { id: 'art', title: 'Seni', icon: FiPenTool, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500' },
];

export default function SemesterReportsPage() {
    const [reports, setReports] = useState<SemesterReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSemesterReports();
    }, []);

    const fetchSemesterReports = async () => {
        setIsLoading(true);
        setError('');
        try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Token tidak ditemukan. Silakan login kembali.');
            return;
        }
        const response = await fetch('http://localhost:3000/api/semester-reports/my-child-reports', {
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
            if (data.success) {
                setReports(data.reports);
            } else {
                setError(data.message || 'Gagal mengambil laporan semester');
            }
        } catch (error) {
            console.error('Error fetching semester reports:', error);
            setError('Terjadi kesalahan saat mengambil laporan semester');
        } finally {
            setIsLoading(false);
        }
    };

    const formatChecklistItemName = (key: string) => {
        return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const getStatusChip = (status: string) => {
        switch (status) {
        case 'Konsisten':
            return (
            <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <FiCheck className="h-3 w-3" />
                <span>Konsisten</span>
            </span>
            );
        case 'Belum Konsisten':
            return (
            <span className="inline-flex items-center space-x-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                <FiX className="h-3 w-3" />
                <span>Belum Konsisten</span>
            </span>
            );
        case 'Tidak Teramati':
            return (
            <span className="inline-flex items-center space-x-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                <FiMinus className="h-3 w-3" />
                <span>Tidak Teramati</span>
            </span>
            );
        default:
            return <span>{status}</span>;
        }
    };

    const ChecklistSection = ({ title, data, id }: { title: string; data: ChecklistItem; id: string }) => (
        <div id={id} className="py-4 scroll-mt-20"> 
        
        <h4 className="text-xl font-bold text-brand-purple border-b border-gray-200 pb-3 mb-4">{title}</h4>
        
        <div className="space-y-2"> 
            {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                <span className="text-sm text-gray-700">{formatChecklistItemName(key)}</span>
                {getStatusChip(value)}
            </div>
            ))}
        </div>
        </div>
    );

    return (
        <div className="space-y-6">
        <Link
            href="/parentDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <h1 className="text-3xl font-bold text-brand-purple">
            Laporan Semester
        </h1>

        {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            </div>
        )}

        {isLoading ? (
            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <div className="text-gray-600">Memuat laporan semester...</div>
            </div>
        ) : reports.length > 0 ? (
            <div className="space-y-6">
            {reports.map((report) => (
                <div key={report._id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                    <FiBookOpen className="h-6 w-6 text-brand-purple" />
                    <div>
                        <h3 className="text-xl font-semibold text-brand-purple">
                        {report.child_id.name} - Semester {report.semester.split('-')[1]} Tahun {report.semester.split('-')[0]}
                        </h3>
                        <p className="text-sm text-gray-500">
                        Disiapkan oleh: {report.teacher_id.name}
                        </p>
                    </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 md:mt-0">
                    Dibuat: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    </span>
                </div>
                
                <div className="mb-6 pt-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {/* Ganti gap-3 jadi gap-4 */}
                    {reportSections.map((section) => (
                        <a 
                        key={section.id}
                        href={`#${section.id}`}
                        className={`flex items-center space-x-4 rounded-lg p-5 transition-all hover:shadow-lg ${section.bgColor}`}
                        >
                        <div className={`rounded-full p-3 ${section.iconColor} bg-white`}>
                            <section.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-base font-semibold text-brand-purple">{section.title}</div>
                        </div>
                        </a>
                    ))}
                    </div>
                </div>

                <div className="divide-y divide-gray-100 border-t border-gray-200">
                    <ChecklistSection id="religious" title="Nilai Agama dan Moral" data={report.religious_moral} />
                    <ChecklistSection id="social" title="Sosial Emosional" data={report.social_emotional} />
                    <ChecklistSection id="cognitive" title="Kognitif" data={report.cognitive} />
                    <ChecklistSection id="language" title="Bahasa" data={report.language} />
                    <ChecklistSection id="gross-motor" title="Motorik Kasar" data={report.gross_motor} />
                    <ChecklistSection id="fine-motor" title="Motorik Halus" data={report.fine_motor} />
                    <ChecklistSection id="independence" title="Kemandirian" data={report.independence} />
                    <ChecklistSection id="art" title="Seni" data={report.art} />
                    
                    {report.teacher_notes && (
                    <div id="teacher-notes" className="py-4 scroll-mt-20">
                        <h4 className="text-md font-semibold text-brand-purple">Catatan Akhir Guru</h4>
                        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-gray-600 italic">{report.teacher_notes}</p>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <p className="text-gray-600">
                Belum ada laporan semester yang tersedia.
            </p>
            </div>
        )}
        </div>
    );
    }
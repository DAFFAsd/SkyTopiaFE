'use client'; 

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FiChevronLeft, FiSearch, FiUpload, FiEdit, FiTrash2,
    } from 'react-icons/fi';

    const mockChildrenData = [
        { id: 1, name: 'Andrew Brown', avatar: '/avatars/andrew.svg', group: 'A' },
        { id: 2, name: 'Ann Letting', avatar: '/avatars/ann.svg', group: 'A' },
        { id: 3, name: 'Boniface Walker', avatar: '/avatars/boniface.svg', group: 'B' },
        { id: 4, name: 'Bernice Muthoni', avatar: '/avatars/bernice.svg', group: 'B' },
        { id: 5, name: 'Brian Githinji', avatar: '/avatars/brian.svg', group: 'B' },
        { id: 6, name: 'Ben Onyiego', avatar: '/avatars/ben.svg', group: 'B' },
        { id: 7, name: 'Cyril Adhiambo', avatar: '/avatars/cyril.svg', group: 'C' },
        { id: 8, name: 'Christian Robert', avatar: '/avatars/christian.svg', group: 'C' },
    ];

    const selectedChildDetail = {
        id: 8,
        firstName: 'Christian',
        lastName: 'Robert',
        avatar: '/avatars/christian-profile.svg', 
        dob: '23-09-2012',
        gender: 'Male',
        daycare: 'TPAM Makara UI',
        category: 'Infanta',
        room: 'Sunshine',
        enrolledOn: '11/02/2025',
        admissionNo: 'Kili/Run/123/15',
        incidences: 1,
        disability: 'None',
        country: 'Indonesia',
        cityState: 'Tangerang Selatan',
        zipCode: '15318',
        physicalAddress: 'Taman Kencana, BSD',
    };
    
    const groupedChildren = mockChildrenData.reduce((acc, child) => {
    const group = child.group;
    if (!acc[group]) {
        acc[group] = [];
    }
    acc[group].push(child);
    return acc;
    }, {} as Record<string, typeof mockChildrenData>);


    function ChildList({ onSelectChild, selectedChildId }: { onSelectChild: (id: number) => void; selectedChildId: number; }) {
    return (
        <div className="w-150 flex-shrink-0 border-r border-gray-200 bg-white">
        {/* Tombol Back & Title */}
        <div className="flex items-center space-x-2 border-b border-gray-200 p-4">
            <Link href="/dashboard" className="rounded-md p-1 hover:bg-gray-100">
            <FiChevronLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-800">Semua Anak</h2>
        </div>

        {/* Search Bar Kiri */}
        <div className="p-4">
            <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder="Cari anak..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            </div>
        </div>

        {/* Daftar Anak */}
        <div className="h-full overflow-y-auto">
            {Object.entries(groupedChildren).map(([group, children]) => (
            <div key={group}>
                <div className="p-4 pt-0">
                <span className="text-sm font-semibold text-gray-500">{group}</span>
                </div>
                <ul>
                {children.map((child) => (
                    <li key={child.id}>
                    <button
                        onClick={() => onSelectChild(child.id)}
                        className={`flex w-full items-center space-x-3 px-4 py-3 text-left
                        ${
                            selectedChildId === child.id
                            ? 'border-r-4 border-active-pink-text bg-active-pink text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                        `}
                    >
                        <Image
                        src={child.avatar} // <-- Ini udah otomatis pake path lokal
                        alt={child.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        />
                        <span className="font-medium">{child.name}</span>
                    </button>
                    </li>
                ))}
                </ul>
            </div>
            ))}
        </div>
        </div>
    );
    }

    function ChildProfile({ child }: { child: typeof selectedChildDetail }) {
    const [activeTab, setActiveTab] = useState('info');

    const tabs = [
        { id: 'info', name: 'Informasi Anak' },
        { id: 'parent', name: 'Detail Orang Tua' },
        { id: 'emergency', name: 'Kontak Darurat' },
        { id: 'attendance', name: 'Kehadiran' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Profil Anak</h1>

        {/* Banner & Info Utama */}
        <div className="rounded-lg bg-white shadow-sm">
            <div className="h-28 rounded-t-lg bg-profile-banner"></div>
            <div className="flex flex-wrap items-end gap-4 p-6">
            <Image
                src={child.avatar} 
                alt={child.firstName}
                width={80}
                height={80}
                className="-mt-14 rounded-full border-4 border-white"
            />
            <h2 className="text-2xl font-bold text-gray-900">
                {child.firstName} {child.lastName}
            </h2>
            <div className="flex-grow"></div>
            <div className="flex space-x-2">
                <button className="flex items-center space-x-2 rounded-lg bg-button-transfer px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                <FiUpload className="h-4 w-4" />
                <span>Pindah</span>
                </button>
                <button className="flex items-center space-x-2 rounded-lg bg-button-edit px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                <FiEdit className="h-4 w-4" />
                <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 rounded-lg bg-button-delete px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                <FiTrash2 className="h-4 w-4" />
                <span>Hapus</span>
                </button>
            </div>
            </div>

            {/* Navigasi Tab */}
            <nav className="flex space-x-4 border-b border-gray-200 px-6">
            {tabs.map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 text-sm font-medium
                    ${
                    activeTab === tab.id
                        ? 'border-b-2 border-active-pink-text text-active-pink-text'
                        : 'text-gray-500 hover:text-gray-700'
                    }
                `}
                >
                {tab.name}
                </button>
            ))}
            </nav>

            {/* Konten Tab */}
            <div className="p-6">
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
                <InfoItem label="Nama Depan" value={child.firstName} />
                <InfoItem label="Nama Belakang" value={child.lastName} />
                <InfoItem label="Tgl. Lahir" value={child.dob} />
                <InfoItem label="Jenis Kelamin" value={child.gender} />
                <InfoItem label="Daycare" value={child.daycare} />
                <InfoItem label="Kategori" value={child.category} />
                <InfoItem label="Kelas" value={child.room} />
                <InfoItem label="Tgl. Masuk" value={child.enrolledOn} />
                <InfoItem label="No. Pendaftaran" value={child.admissionNo} />
                <InfoItem label="Insiden" value={child.incidences} />
                <InfoItem label="Disabilitas" value={child.disability} />
                <InfoItem label="Negara" value={child.country} />
                <InfoItem label="Kota/Provinsi" value={child.cityState} />
                <InfoItem label="Kode Pos" value={child.zipCode} />
                <InfoItem label="Alamat" value={child.physicalAddress} className="md:col-span-2" />
                </div>
            )}
            {activeTab === 'parent' && <div className='text-gray-600'>Konten Detail Orang Tua akan muncul di sini.</div>}
            {activeTab === 'emergency' && <div className='text-gray-600'>Konten Kontak Darurat akan muncul di sini.</div>}
            {activeTab === 'attendance' && <div className='text-gray-600'>Konten Kehadiran akan muncul di sini.</div>}
            </div>
        </div>
        </div>
    );
    }

    function InfoItem({ label, value, className = '' }: { label: string; value: string | number; className?: string; }) {
    return (
        <div className={`break-words ${className}`}>
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-800">{value}</div>
        </div>
    );
    }

    export default function ChildrenPage() {
    const [selectedChildId, setSelectedChildId] = useState(8); 

    const selectedChild = selectedChildDetail; 

    return (
        <div className="flex h-full">
        {/* Kolom Kiri */}
        <ChildList
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
        />

        {/* Kolom Tengah */}
        <ChildProfile child={selectedChild} />
        </div>
    );
}
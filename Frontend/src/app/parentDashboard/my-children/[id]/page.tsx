'use client'; // <-- Wajib 'use client' untuk baca parameter

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useParams } from 'next/navigation'; // <-- Import hook

export default function ChildDetailPage() {
  const params = useParams(); // <-- Ambil parameter
  const { id } = params; // <-- Ambil 'id' dari URL

    return (
        <div className="space-y-6">
        {/* Tombol Kembali ke Daftar Anak */}
        <Link
            href="/parentDashboard/my-children"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Anak</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-brand-purple">
            Detail Anak
        </h1>
        
        <div className="rounded-lg bg-white p-8 shadow-sm">
            <p className="text-gray-600">
            Halaman ini sedang dalam pengembangan. 
            Detail untuk anak dengan ID: 
            <span className="ml-2 rounded bg-gray-200 px-2 py-1 font-mono text-sm text-brand-purple">{id}</span> 
            {' '}akan muncul di sini.
            </p>
            {/* Nanti di sini kita fetch GET /api/children/{id} */}
        </div>
        </div>
    );
}
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AttendancePage() {
    return (
        <div className="space-y-6">
        <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>
        <h1 className="text-3xl font-bold text-brand-purple">Catat Absensi</h1>
        <div className="rounded-lg bg-white p-8 shadow-sm">
            <p className="text-gray-600">Halaman ini sedang dalam pengembangan. Fitur untuk mencatat absensi (POST /api/attendance) akan ada di sini.</p>
        </div>
        </div>
    );
}
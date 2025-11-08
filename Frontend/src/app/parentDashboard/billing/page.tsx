import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function BillingPage() {
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
            Tagihan & Pembayaran
        </h1>
        
        <div className="rounded-lg bg-white p-8 shadow-sm">
            <p className="text-gray-600">
            Halaman ini sedang dalam pengembangan. 
            Konten untuk riwayat tagihan dan status pembayaran akan muncul di sini.
            </p>
            {/* Nanti di sini kita fetch GET /api/payments/my-payments */}
        </div>
        </div>
    );
}
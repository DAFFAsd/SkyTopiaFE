import Link from 'next/link';

export default function FacilityReportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-purple">Laporan Kondisi Fasilitas</h1>
      <p className="text-gray-600">Placeholder page for facility condition reports and maintenance logs.</p>
      <Link href="/adminDashboard" className="text-sm text-brand-purple">← Back to Admin Dashboard</Link>
    </div>
  );
}

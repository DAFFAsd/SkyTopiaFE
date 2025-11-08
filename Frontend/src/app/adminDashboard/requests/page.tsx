import Link from 'next/link';

export default function RequestsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-purple">Persetujuan Permintaan Inventaris Guru</h1>
      <p className="text-gray-600">Placeholder page for managing inventory requests from teachers.</p>
      <Link href="/adminDashboard" className="text-sm text-brand-purple">← Back to Admin Dashboard</Link>
    </div>
  );
}

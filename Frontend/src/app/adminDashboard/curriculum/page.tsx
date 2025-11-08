import Link from 'next/link';

export default function CurriculumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-purple">Kurikulum Dan Jadwal</h1>
      <p className="text-gray-600">Placeholder page for curriculum and schedule management.</p>
      <Link href="/adminDashboard" className="text-sm text-brand-purple">← Back to Admin Dashboard</Link>
    </div>
  );
}

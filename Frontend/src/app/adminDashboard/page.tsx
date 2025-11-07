import Image from 'next/image';
import Link from 'next/link';
import { FiUsers, FiDatabase, FiCalendar, FiClipboard } from 'react-icons/fi';
import PaymentChart from '../dashboard/components/PaymentChart';

function AdminTile({ title, icon: Icon, color = 'bg-pink-100', href }: { title: string; icon: any; color?: string; href?: string }) {
  const tile = (
    <div className={`tile-card animate-float flex items-center space-x-4 rounded-lg p-6 ${color} h-40`}>
      <div className="rounded-full p-3 bg-white text-2xl">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-lg font-semibold text-brand-purple">{title}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="tile-link">
        {tile}
      </Link>
    );
  }

  return tile;
}

export default function DashboardAdminPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-brand-purple">Dashboard Admin</h2>

  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 auto-rows-fr">
        <AdminTile
          title="Persetujuan Permintaan Inventaris Guru"
          icon={FiUsers}
          color="bg-stat-pink-bg"
          href="/adminDashboard/requests"
        />
        <AdminTile
          title="Laporan Kondisi Fasilitas"
          icon={FiClipboard}
          color="bg-stat-blue-bg/50"
          href="/adminDashboard/facility-report"
        />
        <AdminTile
          title="Database Guru"
          icon={FiDatabase}
          color="bg-stat-blue-bg/50"
          href="/adminDashboard/database"
        />
        <AdminTile
          title="Kurikulum Dan Jadwal"
          icon={FiCalendar}
          color="bg-stat-pink-bg"
          href="/adminDashboard/curriculum"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-gray-500">YTD Payments</div>
              <div className="text-xs bg-brand-purple/10 text-brand-purple rounded-full px-3 py-1">2022</div>
            </div>
            <PaymentChart />
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <Image src="/toy-blocks.svg" alt="Toy blocks" width={320} height={260} />
        </div>
      </div>

      {/* Stats cards removed for admin dashboard per request */}
    </div>
  );
}

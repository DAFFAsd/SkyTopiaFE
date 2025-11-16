import Link from 'next/link';
import { FiUsers, FiDatabase, FiCalendar, FiClipboard, FiBarChart } from 'react-icons/fi';

function AdminTile({ title, icon: Icon, color = 'bg-pink-100', href }: { title: string; icon: any; color?: string; href?: string }) {
	const tile = (
		<div className={`tile-card flex flex-col justify-center items-start space-y-3 rounded-lg p-6 ${color} h-36 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md`}>
			<div className="rounded-full p-3 bg-white text-2xl">
				<Icon className="h-6 w-6" />
			</div>
			<div className="text-lg font-semibold text-brand-purple">{title}</div>
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="tile-link block">
				{tile}
			</Link>
		);
	}

	return tile;
}

export default function DashboardAdminPage() {
	return (
		<div className="space-y-8">
			<div className="relative rounded-lg bg-welcome-yellow p-8">
				<h1 className="text-3xl font-bold text-brand-purple mb-2">Halo, Admin!</h1>
				<p className="text-gray-600 text-lg">
					Selamat datang di dasbor admin. Silakan pilih tugas yang ingin Anda lakukan.
				</p>
			</div>
<h3 className="text-xl font-bold text-brand-purple mb-4">Tugas Utama</h3>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<AdminTile
						title="Persetujuan Permintaan Inventaris Guru"
						icon={FiUsers}
						color="bg-stat-pink-bg"
						href="/adminDashboard/requests"
					/>
				</div>

				<div>
					<AdminTile
						title="Laporan Kondisi Fasilitas"
						icon={FiClipboard}
						color="bg-stat-blue-bg/50"
						href="/adminDashboard/facility-report"
					/>
				</div>

				<div>
					<AdminTile
						title="Database Guru"
						icon={FiDatabase}
						color="bg-stat-pink-bg"
						href="/adminDashboard/database"
					/>
				</div>

				<div>
					<AdminTile
						title="Kurikulum Dan Jadwal"
						icon={FiCalendar}
						color="bg-stat-blue-bg/50"
						href="/adminDashboard/curriculum"
					/>
				</div>

				<div>
					<AdminTile
						title="Laporan Inventaris"
						icon={FiBarChart}
						color="bg-stat-pink-bg"
						href="/adminDashboard/inventory-reports"
					/>
				</div>

				<div className="hidden lg:block">
					<div className="tile-card flex flex-col justify-center items-start rounded-lg p-6 bg-white h-36">
						<div className="text-sm text-gray-400">Additional</div>
						<div className="text-lg font-semibold text-brand-purple">Placeholder</div>
					</div>
				</div>
			</div>
		</div>
	);
}


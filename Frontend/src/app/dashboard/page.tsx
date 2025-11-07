// app/dashboard/page.tsx
import Image from 'next/image';
import StatsCard from './components/StatsCard';
import PaymentChart from './components/PaymentChart';

import { FiUser, FiGrid, FiUsers } from 'react-icons/fi';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-brand-purple">Dashboard</h2>

        <div className="relative rounded-lg bg-welcome-yellow p-8">
            <div className="max-w-md">
            <h3 className="text-2xl font-semibold text-brand-purple ml-5">
                Halo, Anna!
            </h3>
            <p className="mt-2 text-brand-purple ml-5">
                Ini adalah ringkasan aktivitas di SkyTopia. Pantau terus perkembangan buah hati Anda di sini.
            </p>
            </div>
            {/* Ilustrasi */}
            <div className="absolute right-20 top-3 bottom-0 hidden lg:block">
            <Image
                src="/woman-at-desk.svg" 
                alt="Woman at desk"
                width={150}
                height={100}
            />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
            title="Guru"
            value={75}
            icon={FiUser}
            bgColor="bg-stat-pink-bg"
            iconColor="text-pink-500"
            />
            <StatsCard
            title="Kelas"
            value={14}
            icon={FiGrid}
            bgColor="bg-stat-blue-bg/30"
            iconColor="text-sky-500"
            />
            <StatsCard
            title="Anak"
            value={127}
            icon={FiUsers}
            bgColor="bg-stat-pink-bg"
            iconColor="text-pink-500"
            />
            <StatsCard
            title="Orang Tua"
            value={20}
            icon={FiUsers}
            bgColor="bg-stat-blue-bg/30" 
            iconColor="text-sky-500"
            />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
            <PaymentChart />
            </div>

            <div className="hidden items-center justify-center lg:flex">
            <Image
                src="/toy-blocks.svg" 
                alt="Toy blocks"
                width={250}
                height={200}
            />
            </div>
        </div>
        
        </div>
    );
}
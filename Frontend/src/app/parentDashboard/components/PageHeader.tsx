// Page Header Component
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

interface PageHeaderProps {
    title: string;
    backUrl?: string;
    backLabel?: string;
}

export default function PageHeader({ 
    title, 
    backUrl = '/parentDashboard', 
    backLabel = 'Kembali ke Dasbor' 
}: PageHeaderProps) {
    return (
        <div className="space-y-4">
            <Link href={backUrl} className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>{backLabel}</span>
            </Link>
            <h1 className="font-rammetto text-3xl text-brand-purple mb-4">{title}</h1>
        </div>
    );
}

// app/dashboard/components/StatsCard.tsx
import { IconType } from 'react-icons'; 

type StatsCardProps = {
    title: string;
    value: number | string;
    icon: IconType;
    bgColor: string; 
    iconColor: string; 
};

export default function StatsCard({ title, value, icon: Icon, bgColor, iconColor }: StatsCardProps) {
    return (
        <div className={`flex items-center space-x-4 rounded-lg p-5 ${bgColor}`}>
        <div className={`rounded-full p-3 ${iconColor} bg-white`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <div className="text-sm font-medium text-gray-500">{title}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
        </div>
    );
}
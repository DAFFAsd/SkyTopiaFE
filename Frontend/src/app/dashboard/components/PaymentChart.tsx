// app/dashboard/components/PaymentChart.tsx
'use client'; // 

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Jan', 'YTD Payments': 22000 },
    { name: 'Feb', 'YTD Payments': 21000 },
    { name: 'Mar', 'YTD Payments': 35000 },
    { name: 'Apr', 'YTD Payments': 28000 },
    { name: 'May', 'YTD Payments': 32000 },
    { name: 'Jun', 'YTD Payments': 25000 },
    { name: 'Jul', 'YTD Payments': 38000 },
    { name: 'Aug', 'YTD Payments': 12000 },
    { name: 'Sep', 'YTD Payments': 22000 },
    { name: 'Oct', 'YTD Payments': 24000 },
];

export default function PaymentChart() {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pembayaran Tahun Ini</h3>
            <span className="rounded-md bg-brand-purple px-3 py-1 text-sm text-white">2022</span>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                formatter={(value: number) => [
                    new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    }).format(value),
                    'Total'
                ]}
                />
                <Line
                type="monotone"
                dataKey="YTD Payments"
                stroke="#D36F9D" 
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
}
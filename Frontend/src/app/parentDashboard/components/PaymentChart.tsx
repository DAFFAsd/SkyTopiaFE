'use client'; 

import { useState, useEffect } from 'react'; 
import { FiLoader } from 'react-icons/fi';
import { apiUrl } from '@/lib/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface MonthlyPayment {
    name: string;
    'Total Pembayaran': number; 
}

const processPaymentData = (payments: { status: string; paid_at: string; amount: number }[]) => {
    const monthlyTotals: Record<number, number> = {}; 
    for (let i = 1; i <= 12; i++) {
        monthlyTotals[i] = 0;
    }

    payments
        .filter(p => p.status === 'Dibayar' && p.paid_at) 
        .forEach(p => {
            const paidDate = new Date(p.paid_at);
            const month = paidDate.getMonth() + 1; 
            const year = paidDate.getFullYear();
            const currentYear = new Date().getFullYear();

            if (year === currentYear) {
                monthlyTotals[month] += p.amount;
            }
        });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return monthNames.map((name, index) => ({
        name: name,
        'Total Pembayaran': monthlyTotals[index + 1],
    }));
};


export default function PaymentChart() {
    const [chartData, setChartData] = useState<MonthlyPayment[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentYear = new Date().getFullYear(); 

    const formatAxisTick = (value: number) => {
        const formatter = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1, 
        });

        if (value >= 1000000) {
            return formatter.format(value / 1000000) + ' Jt'; 
        }
        if (value >= 1000) {
            return formatter.format(Math.round(value / 1000)) + 'K';
        }
        return formatter.format(value);
    };

    const fetchChartData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Token tidak ditemukan.");

            const response = await fetch(apiUrl('/payments/my-payments'), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) throw new Error("Gagal mengambil data pembayaran dari server.");
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.payments)) {
                const processedData = processPaymentData(data.payments);
                setChartData(processedData);
            } else {
                throw new Error(data.message || "Data pembayaran tidak valid.");
            }

        } catch (err: unknown) {
            console.error("Error fetching payment data:", err);
            setError(err instanceof Error ? err.message : "Gagal memuat data chart.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <FiLoader className="h-6 w-6 text-brand-purple animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Memuat data pembayaran...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-6 shadow-sm text-center border border-red-200">
                <p className="text-sm text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pembayaran Tahun Ini</h3>
                <span className="rounded-md bg-brand-purple px-3 py-1 text-sm text-white">
                    {currentYear}
                </span>
            </div>
            
            {chartData.every(d => d['Total Pembayaran'] === 0) ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                    Belum ada pembayaran yang tercatat tahun ini.
                </div>
            ) : (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                        
                        <YAxis 
                            stroke="#a1a1aa" 
                            fontSize={12} 
                            domain={[0, 'auto']} 
                            tickFormatter={formatAxisTick}
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
                        dataKey="Total Pembayaran"
                        stroke="#D36F9D" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
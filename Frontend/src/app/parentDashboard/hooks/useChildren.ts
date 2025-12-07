// Custom hook untuk fetch children data
'use client';

import { useState, useEffect } from 'react';
import type { Child } from '../types';
import { apiUrl } from '@/lib/api';

export function useChildren() {
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChildren = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login kembali.');
            }

            const response = await fetch(apiUrl('/children/my-children'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil data anak');
            }

            if (data.success) {
                setChildren(data.children);
            } else {
                throw new Error(data.message || 'Gagal mengambil data anak');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(errorMessage);
            console.error('Error fetching children:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    return { children, isLoading, error, refetch: fetchChildren };
}

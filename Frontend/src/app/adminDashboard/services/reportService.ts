// API Service for Reports Management
import { API_BASE_URL } from '@/lib/api';
import { DailyReport, SemesterReport, DailyReportApiResponse, SemesterReportApiResponse } from '../types/report.types';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// ==================== DAILY REPORTS ====================

/**
 * Get all daily reports (Admin only)
 */
export const getAllDailyReports = async (): Promise<DailyReport[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/daily-reports`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: DailyReportApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil laporan harian');
        }

        return data.reports || [];
    } catch (error) {
        console.error('Error fetching all daily reports:', error);
        throw error;
    }
};

/**
 * Get daily report by ID
 */
export const getDailyReportById = async (id: string): Promise<DailyReport> => {
    try {
        const response = await fetch(`${API_BASE_URL}/daily-reports/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: DailyReportApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil laporan harian');
        }

        if (!data.report) {
            throw new Error('Laporan harian tidak ditemukan');
        }

        return data.report;
    } catch (error) {
        console.error('Error fetching daily report by ID:', error);
        throw error;
    }
};

// ==================== SEMESTER REPORTS ====================

/**
 * Get all semester reports (Admin only)
 */
export const getAllSemesterReports = async (): Promise<SemesterReport[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/semester-reports`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: SemesterReportApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil laporan semester');
        }

        return data.reports || [];
    } catch (error) {
        console.error('Error fetching all semester reports:', error);
        throw error;
    }
};

/**
 * Get semester report by ID
 */
export const getSemesterReportById = async (id: string): Promise<SemesterReport> => {
    try {
        const response = await fetch(`${API_BASE_URL}/semester-reports/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: SemesterReportApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil laporan semester');
        }

        if (!data.report) {
            throw new Error('Laporan semester tidak ditemukan');
        }

        return data.report;
    } catch (error) {
        console.error('Error fetching semester report by ID:', error);
        throw error;
    }
};

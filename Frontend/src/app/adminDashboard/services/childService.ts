// API Service for Child Management
import { Child, ChildFormData, ChildApiResponse } from '../types/child.types';

const API_BASE_URL = 'http://localhost:3000/api';

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

/**
 * Get all children (Admin only)
 */
export const getAllChildren = async (): Promise<Child[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data anak');
        }

        return data.children || [];
    } catch (error) {
        console.error('Error fetching all children:', error);
        throw error;
    }
};

/**
 * Get child by ID
 */
export const getChildById = async (id: string): Promise<Child> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data anak');
        }

        if (!data.child) {
            throw new Error('Data anak tidak ditemukan');
        }

        return data.child;
    } catch (error) {
        console.error('Error fetching child by ID:', error);
        throw error;
    }
};

/**
 * Create new child (Admin only)
 */
export const createChild = async (childData: ChildFormData): Promise<Child> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(childData)
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat data anak');
        }

        if (!data.child) {
            throw new Error('Data anak tidak ditemukan dalam response');
        }

        return data.child;
    } catch (error) {
        console.error('Error creating child:', error);
        throw error;
    }
};

/**
 * Update child (Admin only)
 */
export const updateChild = async (id: string, childData: ChildFormData): Promise<Child> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(childData)
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengupdate data anak');
        }

        if (!data.child) {
            throw new Error('Data anak tidak ditemukan dalam response');
        }

        return data.child;
    } catch (error) {
        console.error('Error updating child:', error);
        throw error;
    }
};

/**
 * Delete child (Admin only)
 */
export const deleteChild = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus data anak');
        }
    } catch (error) {
        console.error('Error deleting child:', error);
        throw error;
    }
};

/**
 * Search children by name or parent name (Admin only)
 */
export const searchChildren = async (searchQuery: string): Promise<Child[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/search?search=${encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mencari data anak');
        }

        return data.children || [];
    } catch (error) {
        console.error('Error searching children:', error);
        throw error;
    }
};

/**
 * Add schedule to child (Admin only)
 */
export const addScheduleToChild = async (childId: string, scheduleId: string): Promise<Child> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/schedules/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ childId, scheduleId })
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menambahkan jadwal');
        }

        if (!data.child) {
            throw new Error('Data anak tidak ditemukan dalam response');
        }

        return data.child;
    } catch (error) {
        console.error('Error adding schedule to child:', error);
        throw error;
    }
};

/**
 * Remove schedule from child (Admin only)
 */
export const removeScheduleFromChild = async (childId: string, scheduleId: string): Promise<Child> => {
    try {
        const response = await fetch(`${API_BASE_URL}/children/schedules/remove`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ childId, scheduleId })
        });

        const data: ChildApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus jadwal');
        }

        if (!data.child) {
            throw new Error('Data anak tidak ditemukan dalam response');
        }

        return data.child;
    } catch (error) {
        console.error('Error removing schedule from child:', error);
        throw error;
    }
};

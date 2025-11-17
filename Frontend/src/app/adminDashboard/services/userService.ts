// API Service for User Management
import { User, UserFormData, UserApiResponse } from '../types/user.types';

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
 * Get all users (Admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data pengguna');
        }

        return data.users || [];
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (id: string): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data pengguna');
        }

        if (!data.user) {
            throw new Error('Data pengguna tidak ditemukan');
        }

        return data.user;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
};

/**
 * Register/Create new user (Admin only)
 */
export const createUser = async (userData: UserFormData): Promise<User> => {
    try {
        // Prepare payload matching backend schema
        const payload = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || undefined,
            role: userData.role
        };

        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat pengguna baru');
        }

        if (!data.user) {
            throw new Error('Data pengguna tidak ditemukan dalam response');
        }

        return data.user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    try {
        // Prepare payload - only include fields that can be updated
        const payload: any = {
            name: userData.name,
            phone: userData.phone || undefined
        };

        // Only include password if it's provided and not empty
        if (userData.password && userData.password.trim() !== '') {
            payload.password = userData.password;
        }

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengupdate pengguna');
        }

        if (!data.user) {
            throw new Error('Data pengguna tidak ditemukan dalam response');
        }

        return data.user;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus pengguna');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data: UserApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil profil pengguna');
        }

        if (!data.user) {
            throw new Error('Data profil tidak ditemukan');
        }

        return data.user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Filter users by role
 */
export const getUsersByRole = async (role: 'Teacher' | 'Parent' | 'Admin'): Promise<User[]> => {
    try {
        const allUsers = await getAllUsers();
        return allUsers.filter(user => user.role === role);
    } catch (error) {
        console.error('Error filtering users by role:', error);
        throw error;
    }
};

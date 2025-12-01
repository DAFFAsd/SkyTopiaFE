// Type definitions for User Management in Admin Dashboard

export type UserRole = 'Teacher' | 'Parent' | 'Admin';

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    // Additional fields for extended functionality
    nip?: string; // Employee ID for teachers (can be stored in phone or separate field)
    assignedClass?: string; // For teachers
    address?: string; // For parents
    childId?: string; // Link parent to child
}

export interface UserApiResponse {
    success: boolean;
    message?: string;
    user?: User;
    users?: User[];
    token?: string;
}

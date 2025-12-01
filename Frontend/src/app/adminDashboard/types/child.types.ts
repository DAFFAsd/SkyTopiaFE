// Type definitions for Child Management in Admin Dashboard

export interface Parent {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Teacher {
    _id: string;
    name: string;
    email?: string;
}

export interface Curriculum {
    _id: string;
    title: string;
    description?: string;
    grade?: string;
}

export interface Schedule {
    _id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher?: Teacher;
    curriculum?: Curriculum;
    location?: string;
}

export interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: 'Laki-laki' | 'Perempuan';
    parent_id: Parent;
    medical_notes?: string;
    monthly_fee: number;
    semester_fee: number;
    schedules: Schedule[];
    createdAt: string;
    updatedAt: string;
}

export interface ChildFormData {
    name: string;
    birth_date: string;
    gender: 'Laki-laki' | 'Perempuan';
    parent_id: string;
    medical_notes?: string;
    monthly_fee: number;
    semester_fee: number;
    schedules?: string[];
}

export interface ChildApiResponse {
    success: boolean;
    message?: string;
    child?: Child;
    children?: Child[];
    count?: number;
}

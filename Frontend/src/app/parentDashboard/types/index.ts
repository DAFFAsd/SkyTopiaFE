// Type definitions untuk Parent Dashboard

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Child {
    _id: string;
    name: string;
    birth_date: string;
    gender: 'Male' | 'Female';
    medical_notes?: string;
    monthly_fee: number;
    semester_fee: number;
    schedules: Schedule[];
}

export interface Schedule {
    _id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher?: {
        _id: string;
        name: string;
    };
    curriculum?: {
        _id: string;
        title: string;
    };
    location?: string;
}

export interface DailyReport {
    _id: string;
    child: {
        _id: string;
        name: string;
    };
    date: string;
    activities: string;
    healthStatus: 'Good' | 'Sick' | 'Tired' | 'Energetic';
    meals: string;
    mood: 'Happy' | 'Sad' | 'Calm' | 'Excited' | 'Irritable';
    notes: string;
    createdAt: string;
}

export interface SemesterReport {
    _id: string;
    child: {
        _id: string;
        name: string;
    };
    semester: string;
    year: number;
    teacher: {
        _id: string;
        name: string;
    };
    cognitive_development?: string;
    social_emotional_development?: string;
    physical_development?: string;
    language_development?: string;
    overall_notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    _id: string;
    child_id: Child;
    amount: number;
    due_date: string;
    paid_at?: string;
    category: 'Bulanan' | 'Semester' | 'Registrasi';
    period?: string;
    status: 'Tertunda' | 'Terkirim' | 'Dibayar' | 'Ditolak' | 'Jatuh Tempo';
    proof_of_payment_url?: string;
    rejection_reason?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    threadId: string;
    createdAt: string;
    lastMessage?: string;
}

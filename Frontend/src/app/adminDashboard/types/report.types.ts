// Type definitions for Reports in Admin Dashboard

export interface Teacher {
    _id: string;
    name: string;
    email: string;
}

export interface ChildInfo {
    _id: string;
    name: string;
    birth_date: string;
    gender: 'Laki-laki' | 'Perempuan';
    parent_id?: any;
}

export interface Meals {
    snack?: string;
    lunch?: string;
}

export interface DailyReport {
    _id: string;
    child_id: ChildInfo;
    teacher_id: Teacher;
    date: string;
    theme?: string;
    sub_theme?: string;
    physical_motor?: string;
    cognitive?: string;
    social_emotional?: string;
    meals?: Meals;
    nap_duration?: string;
    special_notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type AssessmentValue = 'Belum Konsisten' | 'Konsisten' | 'Tidak Teramati';
export type MotorValue = 'Bantuan Fisik' | 'Bantuan Verbal' | 'Mandiri' | 'Tidak Teramati';

export interface SemesterReportSection {
    [key: string]: AssessmentValue | MotorValue | string | undefined;
}

export interface SemesterReport {
    _id: string;
    child_id: ChildInfo;
    teacher_id: Teacher;
    semester: string;
    religious_moral?: SemesterReportSection;
    social_emotional?: SemesterReportSection;
    cognitive?: SemesterReportSection;
    language?: SemesterReportSection;
    gross_motor?: SemesterReportSection;
    fine_motor?: SemesterReportSection;
    independence?: SemesterReportSection;
    art?: SemesterReportSection;
    createdAt: string;
    updatedAt: string;
}

export interface DailyReportApiResponse {
    success: boolean;
    message?: string;
    report?: DailyReport;
    reports?: DailyReport[];
}

export interface SemesterReportApiResponse {
    success: boolean;
    message?: string;
    report?: SemesterReport;
    reports?: SemesterReport[];
}

export interface ReportFilters {
    childId?: string;
    startDate?: string;
    endDate?: string;
    semester?: string;
}

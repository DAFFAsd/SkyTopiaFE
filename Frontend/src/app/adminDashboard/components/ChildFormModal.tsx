// Child Form Modal Component
'use client';

import { useState, useEffect } from 'react';
import { Child, ChildFormData } from '../types/child.types';
import { apiUrl } from '@/lib/api';

interface Parent {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface ChildFormModalProps {
    isOpen: boolean;
    child: Child | null;
    onClose: () => void;
    onSubmit: (data: ChildFormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function ChildFormModal({
    isOpen,
    child,
    onClose,
    onSubmit,
    isSubmitting = false
}: ChildFormModalProps) {
    const [parents, setParents] = useState<Parent[]>([]);
    const [loadingParents, setLoadingParents] = useState(false);
    const [formData, setFormData] = useState<ChildFormData>({
        name: '',
        birth_date: '',
        gender: 'Laki-laki',
        parent_id: '',
        medical_notes: '',
        monthly_fee: 0,
        semester_fee: 0,
        schedules: []
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ChildFormData, string>>>({});

    useEffect(() => {
        if (isOpen) {
            fetchParents();
        }
    }, [isOpen]);

    useEffect(() => {
        if (child) {
            setFormData({
                name: child.name,
                birth_date: child.birth_date.split('T')[0], 
                gender: child.gender,
                parent_id: child.parent_id._id,
                medical_notes: child.medical_notes || '',
                monthly_fee: child.monthly_fee,
                semester_fee: child.semester_fee,
                schedules: child.schedules.map(s => s._id)
            });
        } else {
            setFormData({
                name: '',
                birth_date: '',
                gender: 'Laki-laki',
                parent_id: '',
                medical_notes: '',
                monthly_fee: 0,
                semester_fee: 0,
                schedules: []
            });
        }
        setErrors({});
    }, [child, isOpen]);

    const fetchParents = async () => {
        setLoadingParents(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl('/users'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                const parentUsers = data.users.filter((user: Parent & { role: string }) => user.role === 'Parent');
                setParents(parentUsers);
            }
        } catch (error) {
            console.error('Error fetching parents:', error);
        } finally {
            setLoadingParents(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ChildFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama anak harus diisi';
        }

        if (!formData.birth_date) {
            newErrors.birth_date = 'Tanggal lahir harus diisi';
        } else {
            const birthDate = new Date(formData.birth_date);
            const today = new Date();
            if (birthDate > today) {
                newErrors.birth_date = 'Tanggal lahir tidak boleh di masa depan';
            }
        }

        if (!formData.parent_id) {
            newErrors.parent_id = 'Orang tua harus dipilih';
        }

        if (formData.monthly_fee < 0) {
            newErrors.monthly_fee = 'Biaya bulanan tidak boleh negatif';
        }

        if (formData.semester_fee < 0) {
            newErrors.semester_fee = 'Biaya semester tidak boleh negatif';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'monthly_fee' || name === 'semester_fee' ? Number(value) : value
        }));
        if (errors[name as keyof ChildFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {child ? 'Edit Data Anak' : 'Tambah Anak Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Masukkan nama lengkap anak"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Lahir <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="birth_date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.birth_date ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                            Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    {/* Parent */}
                    <div>
                        <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Orang Tua / Wali <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            value={formData.parent_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.parent_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loadingParents}
                        >
                            <option value="">Pilih Orang Tua</option>
                            {parents.map((parent) => (
                                <option key={parent._id} value={parent._id}>
                                    {parent.name} - {parent.email}
                                </option>
                            ))}
                        </select>
                        {errors.parent_id && <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>}
                    </div>

                    {/* Medical Notes */}
                    <div>
                        <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan Medis / Alergi
                        </label>
                        <textarea
                            id="medical_notes"
                            name="medical_notes"
                            value={formData.medical_notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            placeholder="Masukkan informasi alergi atau kondisi medis khusus"
                        />
                    </div>

                    {/* Monthly Fee */}
                    <div>
                        <label htmlFor="monthly_fee" className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Bulanan (Rp)
                        </label>
                        <input
                            type="number"
                            id="monthly_fee"
                            name="monthly_fee"
                            value={formData.monthly_fee}
                            onChange={handleChange}
                            min="0"
                            step="1000"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.monthly_fee ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                        />
                        {errors.monthly_fee && <p className="text-red-500 text-sm mt-1">{errors.monthly_fee}</p>}
                    </div>

                    {/* Semester Fee */}
                    <div>
                        <label htmlFor="semester_fee" className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Semester (Rp)
                        </label>
                        <input
                            type="number"
                            id="semester_fee"
                            name="semester_fee"
                            value={formData.semester_fee}
                            onChange={handleChange}
                            min="0"
                            step="1000"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.semester_fee ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                        />
                        {errors.semester_fee && <p className="text-red-500 text-sm mt-1">{errors.semester_fee}</p>}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Menyimpan...' : child ? 'Update' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

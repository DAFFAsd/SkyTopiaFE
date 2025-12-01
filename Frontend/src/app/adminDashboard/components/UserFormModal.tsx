'use client';

import { useState, useEffect } from 'react';
import { User, UserFormData, UserRole } from '../types/user.types';
import { Child } from '../types/child.types';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface UserFormModalProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function UserFormModal({
    isOpen,
    user,
    onClose,
    onSubmit,
    isSubmitting = false
}: UserFormModalProps) {
    const [children, setChildren] = useState<Child[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'Teacher',
        nip: '',
        assignedClass: '',
        address: '',
        childId: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

    useEffect(() => {
        if (isOpen && formData.role === 'Parent') {
            fetchChildren();
        }
    }, [isOpen, formData.role]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', 
                phone: user.phone || '',
                role: user.role,
                nip: '',
                assignedClass: '',
                address: '',
                childId: ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                role: 'Teacher',
                nip: '',
                assignedClass: '',
                address: '',
                childId: ''
            });
        }
        setErrors({});
        setShowPassword(false);
    }, [user, isOpen]);

    const fetchChildren = async () => {
        setLoadingChildren(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/children', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setChildren(data.children);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoadingChildren(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama lengkap harus diisi';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email harus diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!user) {
            if (!formData.password) {
                newErrors.password = 'Password harus diisi';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password minimal 8 karakter';
            }
        } else {
            if (formData.password && formData.password.length < 8) {
                newErrors.password = 'Password minimal 8 karakter';
            }
        }

        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }

        if (formData.role === 'Teacher') {
            if (!formData.nip?.trim()) {
                newErrors.nip = 'NIP (ID Karyawan) harus diisi';
            }
        }

        if (formData.role === 'Parent') {
            if (!formData.childId) {
                newErrors.childId = 'Anak harus dipilih';
            }
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
            [name]: value
        }));
        if (errors[name as keyof UserFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        setFormData(prev => ({
            ...prev,
            role: newRole,
            nip: '',
            assignedClass: '',
            address: '',
            childId: ''
        }));
        setErrors({});
    };

    const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setFormData(prev => ({ ...prev, password }));
        setShowPassword(true);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            disabled={!!user} // Disable role change when editing
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="Teacher">Teacher (Guru)</option>
                            <option value="Parent">Parent (Orang Tua)</option>
                        </select>
                        {user && (
                            <p className="text-xs text-gray-500 mt-1">Role tidak dapat diubah setelah akun dibuat</p>
                        )}
                    </div>

                    {/* Full Name */}
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
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!!user} // Email cannot be changed
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="contoh@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        {user && (
                            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password {!user && <span className="text-red-500">*</span>}
                            {user && <span className="text-gray-500 text-xs">(kosongkan jika tidak ingin mengubah)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Minimal 8 karakter"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        <button
                            type="button"
                            onClick={generatePassword}
                            className="mt-2 text-sm text-brand-purple hover:text-purple-700 font-medium"
                        >
                            Generate Password Otomatis
                        </button>
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="08xx-xxxx-xxxx"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Dynamic Fields for Teacher */}
                    {formData.role === 'Teacher' && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Guru</h3>
                            </div>

                            {/* NIP (Employee ID) */}
                            <div>
                                <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">
                                    NIP (ID Karyawan) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="nip"
                                    name="nip"
                                    value={formData.nip}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                        errors.nip ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan NIP"
                                />
                                {errors.nip && <p className="text-red-500 text-sm mt-1">{errors.nip}</p>}
                            </div>

                            {/* Assigned Class */}
                            <div>
                                <label htmlFor="assignedClass" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kelas yang Diajar
                                </label>
                                <input
                                    type="text"
                                    id="assignedClass"
                                    name="assignedClass"
                                    value={formData.assignedClass}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    placeholder="Contoh: Kelas A, Kelas TK B"
                                />
                            </div>
                        </>
                    )}

                    {/* Dynamic Fields for Parent */}
                    {formData.role === 'Parent' && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Orang Tua</h3>
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    placeholder="Masukkan alamat lengkap"
                                />
                            </div>

                            {/* Link to Child */}
                            <div>
                                <label htmlFor="childId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hubungkan dengan Anak <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="childId"
                                    name="childId"
                                    value={formData.childId}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                        errors.childId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={loadingChildren}
                                >
                                    <option value="">Pilih Anak</option>
                                    {children.map((child) => (
                                        <option key={child._id} value={child._id}>
                                            {child.name} - {new Date(child.birth_date).toLocaleDateString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                                {errors.childId && <p className="text-red-500 text-sm mt-1">{errors.childId}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Pilih anak yang akan dihubungkan dengan akun orang tua ini
                                </p>
                            </div>
                        </>
                    )}

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
                            {isSubmitting ? 'Menyimpan...' : user ? 'Update' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

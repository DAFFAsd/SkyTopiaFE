// Users Management Page - Admin Dashboard
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUsers, FiUser, FiArrowLeft } from 'react-icons/fi';
import { User, UserFormData, UserRole } from '../types/user.types';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import UserFormModal from '../components/UserFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PageHeader from '../../../components/PageHeader';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle search and role filter
    useEffect(() => {
        let filtered = users;

        // Apply role filter
        if (roleFilter !== 'All') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Apply search filter
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.phone && user.phone.includes(searchQuery))
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchQuery, roleFilter, users]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllUsers();
            // Filter out Admin users from the list
            const nonAdminUsers = data.filter(user => user.role !== 'Admin');
            setUsers(nonAdminUsers);
            setFilteredUsers(nonAdminUsers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data pengguna';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (formData: UserFormData) => {
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                // Update existing user
                await updateUser(selectedUser._id, formData);
                showSuccessMessage('Pengguna berhasil diupdate!');
            } else {
                // Create new user
                await createUser(formData);
                showSuccessMessage('Pengguna baru berhasil ditambahkan!');
            }
            setIsFormModalOpen(false);
            setSelectedUser(null);
            await fetchUsers(); // Refresh the list
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data pengguna';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        setIsSubmitting(true);
        try {
            await deleteUser(selectedUser._id);
            showSuccessMessage('Pengguna berhasil dihapus!');
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            await fetchUsers(); // Refresh the list
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus pengguna';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Format date to Indonesian format
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get role badge color
    const getRoleBadgeColor = (role: UserRole): string => {
        switch (role) {
            case 'Teacher':
                return 'bg-blue-100 text-blue-800';
            case 'Parent':
                return 'bg-green-100 text-green-800';
            case 'Admin':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get role display name
    const getRoleDisplayName = (role: UserRole): string => {
        switch (role) {
            case 'Teacher':
                return 'Guru';
            case 'Parent':
                return 'Orang Tua';
            case 'Admin':
                return 'Admin';
            default:
                return role;
        }
    };

    // Count users by role
    const teacherCount = users.filter(u => u.role === 'Teacher').length;
    const parentCount = users.filter(u => u.role === 'Parent').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                    <div className="flex-shrink-0 text-green-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-green-700 font-medium">{successMessage}</p>
                </div>
            )}

            {/* Header */}
            <PageHeader 
                title="Manajemen Pengguna" 
                description="Kelola akun Guru dan Orang Tua"
                actionButton={
                    <button
                        onClick={handleAddUser}
                        className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <FiPlus className="h-5 w-5" />
                        <span>Tambah Pengguna</span>
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FiUser className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Guru</p>
                            <p className="text-2xl font-bold text-gray-900">{teacherCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <FiUsers className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Orang Tua</p>
                            <p className="text-2xl font-bold text-gray-900">{parentCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <FiUsers className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Pengguna</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau nomor telepon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    {/* Role Filter */}
                    <div className="flex items-center space-x-2">
                        <FiFilter className="text-gray-400 h-5 w-5" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'All')}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        >
                            <option value="All">Semua Role</option>
                            <option value="Teacher">Guru</option>
                            <option value="Parent">Orang Tua</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Telepon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Terdaftar
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery || roleFilter !== 'All' ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data pengguna'}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleDisplayName(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <FiTrash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} data
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                            currentPage === page
                                                ? 'bg-brand-purple text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <UserFormModal
                isOpen={isFormModalOpen}
                user={selectedUser}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                childName={selectedUser?.name || ''}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                isDeleting={isSubmitting}
            />
        </div>
    );
}

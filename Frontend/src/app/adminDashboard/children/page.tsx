// Children Management Page - Admin Dashboard
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import { Child, ChildFormData } from '../types/child.types';
import { getAllChildren, createChild, updateChild, deleteChild, searchChildren } from '../services/childService';
import ChildFormModal from '../components/ChildFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function ChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch children on component mount
    useEffect(() => {
        fetchChildren();
    }, []);

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredChildren(children);
        } else {
            const filtered = children.filter(child =>
                child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parent_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parent_id.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredChildren(filtered);
        }
        setCurrentPage(1); // Reset to first page when searching
    }, [searchQuery, children]);

    const fetchChildren = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllChildren();
            setChildren(data);
            setFilteredChildren(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data anak';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddChild = () => {
        setSelectedChild(null);
        setIsFormModalOpen(true);
    };

    const handleEditChild = (child: Child) => {
        setSelectedChild(child);
        setIsFormModalOpen(true);
    };

    const handleDeleteChild = (child: Child) => {
        setSelectedChild(child);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (formData: ChildFormData) => {
        setIsSubmitting(true);
        try {
            if (selectedChild) {
                // Update existing child
                await updateChild(selectedChild._id, formData);
            } else {
                // Create new child
                await createChild(formData);
            }
            setIsFormModalOpen(false);
            setSelectedChild(null);
            await fetchChildren(); // Refresh the list
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data anak';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedChild) return;

        setIsSubmitting(true);
        try {
            await deleteChild(selectedChild._id);
            setIsDeleteModalOpen(false);
            setSelectedChild(null);
            await fetchChildren(); // Refresh the list
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data anak';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredChildren.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate age from birth date
    const calculateAge = (birthDate: string): number => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Format date to Indonesian format
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data anak...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchChildren}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-purple">Data Anak</h1>
                    <p className="text-gray-600 mt-1">Kelola informasi anak yang terdaftar</p>
                </div>
                <button
                    onClick={handleAddChild}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <FiPlus className="h-5 w-5" />
                    <span>Tambah Anak</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Cari nama anak atau nama orang tua..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 text-gray-700">
                    <FiUser className="h-5 w-5" />
                    <span className="font-semibold">Total Anak: {filteredChildren.length}</span>
                    {searchQuery && (
                        <span className="text-sm text-gray-500">
                            (dari {children.length} total)
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Anak
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal Lahir
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jenis Kelamin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orang Tua
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kontak
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jadwal
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data anak'}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((child) => (
                                    <tr key={child._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{child.name}</div>
                                            {child.medical_notes && (
                                                <div className="text-xs text-orange-600">⚠️ Ada catatan medis</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(child.birth_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {calculateAge(child.birth_date)} tahun
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {child.gender}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{child.parent_id.name}</div>
                                            <div className="text-xs text-gray-500">{child.parent_id.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {child.parent_id.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {child.schedules.length} jadwal
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditChild(child)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteChild(child)}
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
                                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredChildren.length)} dari {filteredChildren.length} data
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
            <ChildFormModal
                isOpen={isFormModalOpen}
                child={selectedChild}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedChild(null);
                }}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                childName={selectedChild?.name || ''}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedChild(null);
                }}
                isDeleting={isSubmitting}
            />
        </div>
    );
}

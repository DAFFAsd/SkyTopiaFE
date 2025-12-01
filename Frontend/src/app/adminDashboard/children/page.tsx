'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Child, ChildFormData } from '../types/child.types';
import { getAllChildren, createChild, updateChild, deleteChild } from '../services/childService';
import ChildFormModal from '../components/ChildFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PageHeader from '../../../components/PageHeader';

export default function ChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchChildren();
    }, []);

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
        setCurrentPage(1); 
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
                await updateChild(selectedChild._id, formData);
            } else {
                await createChild(formData);
            }
            setIsFormModalOpen(false);
            setSelectedChild(null);
            await fetchChildren(); 
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
            await fetchChildren();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data anak';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredChildren.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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
            <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            {/* Header */}
            <PageHeader 
                title="Data Anak" 
                description="Kelola informasi anak yang terdaftar"
                actionButton={
                    <button
                        onClick={handleAddChild}
                        className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <FiPlus className="h-5 w-5" />
                        <span>Tambah Anak</span>
                    </button>
                }
            />

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
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentItems.length > 0 ? (
                        currentItems.map((child) => (
                            <div
                                key={child._id}
                                className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:shadow-lg hover:border-login-pink"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="h-24 w-24 rounded-full bg-stat-pink-bg flex items-center justify-center mb-4">
                                        <FiUser className="h-12 w-12 text-pink-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-brand-purple">{child.name}</h3>
                                    <p className="text-sm text-gray-600">{child.gender}</p>
                                    <p className="text-xs text-gray-500 mt-1">Lahir: {formatDate(child.birth_date)}</p>
                                    <div className="flex justify-center gap-2 mt-4">
                                        <button
                                            onClick={() => handleEditChild(child)}
                                            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChild(child)}
                                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                                            title="Hapus"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center">
                            {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data anak'}
                        </p>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow p-4 mt-6">
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

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiLoader, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import { apiUrl } from '@/lib/api';

interface FacilityCondition {
  _id: string;
  facility: {
    name: string;
  };
  reportedBy: {
    name: string;
    role: string;
  };
  description: string;
  images: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export default function FacilityReportPage() {
  const [conditions, setConditions] = useState<FacilityCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(apiUrl('/facility/conditions/all'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch facility conditions');
      }

      setConditions(data.conditions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateConditionStatus = async (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    setUpdating(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(apiUrl(`/facility/conditions/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update condition status');
      }

      // Update local state
      setConditions(conditions.map(cond =>
        cond._id === id ? { ...cond, status } : cond
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(null);
    }
  };

  const toggleDescription = (id: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDescriptions(newExpanded);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
          <FiArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dasbor</span>
        </Link>
        <h1 className="text-2xl font-bold text-brand-purple">Laporan Kondisi Fasilitas</h1>
        <div className="flex justify-center items-center py-8">
          <FiLoader className="animate-spin h-8 w-8 text-brand-purple" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
          <FiArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dasbor</span>
        </Link>
        <h1 className="text-2xl font-bold text-brand-purple">Laporan Kondisi Fasilitas</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/adminDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-2">
        <FiArrowLeft className="h-4 w-4" />
        <span>Kembali ke Dasbor</span>
      </Link>
      <h1 className="text-2xl font-bold text-brand-purple">Laporan Kondisi Fasilitas</h1>

      {conditions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Tidak ada laporan kondisi fasilitas yang tersedia.
        </div>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition) => (
            <div key={condition._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {condition.facility.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Dilaporkan oleh: {condition.reportedBy.name} ({condition.reportedBy.role})
                  </p>
                  <p className="text-sm text-gray-500">
                    Tanggal: {new Date(condition.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    condition.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : condition.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {condition.status}
                  </span>
                  <select
                    value={condition.status}
                    onChange={(e) => updateConditionStatus(condition._id, e.target.value as 'Open' | 'In Progress' | 'Resolved')}
                    disabled={updating === condition._id}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  {updating === condition._id && (
                    <FiLoader className="animate-spin h-4 w-4 text-brand-purple" />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Deskripsi:</span>
                  {condition.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(condition._id)}
                      className="text-sm text-brand-purple hover:underline flex items-center"
                    >
                      {expandedDescriptions.has(condition._id) ? 'Tutup' : 'Lihat lebih banyak'}
                      <FiChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        expandedDescriptions.has(condition._id) ? 'rotate-180' : ''
                      }`} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {expandedDescriptions.has(condition._id) || condition.description.length <= 100
                    ? condition.description
                    : `${condition.description.substring(0, 100)}...`
                  }
                </p>
              </div>

              {condition.images && condition.images.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Gambar:</span>
                  <div className="flex space-x-2 mt-2">
                    {condition.images.map((image, index) => (
                      <Image
                        key={index}
                        src={`http://localhost:3000/${image}`}
                        alt={`Condition ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded border"
                        unoptimized={true} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

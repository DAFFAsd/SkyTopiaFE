"use client";

import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiCamera } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Facility {
    _id: string;
    name: string;
    location: string;
    description: string;
    status: 'Available' | 'Unavailable' | 'Maintenance';
}

interface FacilityCondition {
    _id: string;
    facility: Facility;
    description: string;
    images: string[];
    status: 'Open' | 'In Progress' | 'Resolved';
    createdAt: string;
}

export default function FacilityReportPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [recentReports, setRecentReports] = useState<FacilityCondition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFacilities();
        fetchRecentReports();
    }, []);

    const fetchFacilities = async () => {
        try {
            const response = await fetch('/api/facilities');
            const data = await response.json();
            if (data.success) {
                setFacilities(data.facilities);
            }
        } catch (error) {
            console.error('Error fetching facilities:', error);
            setMessage({ type: 'error', text: 'Gagal mengambil data fasilitas' });
        }
    };

    const fetchRecentReports = async () => {
        try {
            const response = await fetch('/api/facility-conditions');
            const data = await response.json();
            if (data.success) {
                setRecentReports(data.conditions);
            }
        } catch (error) {
            console.error('Error fetching recent reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImages(prev => [...prev, ...files]);
            
            // Create preview URLs for the new images
            const newImageUrls = files.map(file => URL.createObjectURL(file));
            setImageUrls(prev => [...prev, ...newImageUrls]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const newImageUrls = [...imageUrls];
        
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(newImageUrls[index]);
        
        newImages.splice(index, 1);
        newImageUrls.splice(index, 1);
        
        setImages(newImages);
        setImageUrls(newImageUrls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFacility || !description) {
            setMessage({ type: 'error', text: 'Mohon lengkapi semua field yang diperlukan' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // First, upload images if any
            const imageUrls: string[] = [];
            if (images.length > 0) {
                for (const image of images) {
                    const formData = new FormData();
                    formData.append('image', image);
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    const uploadData = await uploadResponse.json();
                    if (uploadData.success) {
                        imageUrls.push(uploadData.url);
                    }
                }
            }

            // Then submit the report
            const response = await fetch(`/api/facilities/${selectedFacility}/conditions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description,
                    images: imageUrls,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Laporan kondisi fasilitas berhasil dikirim!' });
                setDescription('');
                setSelectedFacility('');
                setImages([]);
                setImageUrls([]);
                fetchRecentReports();
            } else {
                setMessage({ type: 'error', text: data.message || 'Terjadi kesalahan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim laporan' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        //tes
        <div className="space-y-6">
            <Link href="/teacherDashboard" className="flex items-center space-x-2 text-sm text-brand-purple hover:underline">
                <FiArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dasbor</span>
            </Link>
            <h1 className="text-3xl font-bold text-brand-purple">Lapor Kondisi Fasilitas</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Form Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Buat Laporan Baru</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="facility" className="block text-sm font-medium text-gray-700">
                                Pilih Fasilitas
                            </label>
                            <select
                                id="facility"
                                value={selectedFacility}
                                onChange={(e) => setSelectedFacility(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                                required
                            >
                                <option value="">Pilih Fasilitas</option>
                                
                                {/* Ruangan Kelas */}
                                <optgroup label="Ruangan Kelas">
                                    <option value="classroom-paud">Ruang PAUD</option>
                                    <option value="classroom-tk">Ruang TK</option>
                                    <option value="classroom-kb">Ruang KB</option>
                                    <option value="classroom-daycare">Ruang Daycare</option>
                                </optgroup>

                                {/* Ruangan Pendukung */}
                                <optgroup label="Ruangan Pendukung">
                                    <option value="room-art">Ruang Seni</option>
                                    <option value="room-library">Perpustakaan</option>
                                    <option value="room-music">Ruang Musik</option>
                                    <option value="room-computer">Lab Komputer</option>
                                    <option value="room-health">UKS</option>
                                    <option value="room-teacher">Ruang Guru</option>
                                    <option value="room-admin">Ruang Administrasi</option>
                                </optgroup>

                                {/* Area Bermain */}
                                <optgroup label="Area Bermain">
                                    <option value="play-indoor">Area Bermain Indoor</option>
                                    <option value="play-outdoor">Area Bermain Outdoor</option>
                                    <option value="play-sandbox">Area Sandbox</option>
                                    <option value="play-waterpark">Area Waterpark</option>
                                </optgroup>

                                {/* Fasilitas Kebersihan */}
                                <optgroup label="Fasilitas Kebersihan">
                                    <option value="sanitary-toilet-student">Toilet Siswa</option>
                                    <option value="sanitary-toilet-teacher">Toilet Guru</option>
                                    <option value="sanitary-wastafel">Wastafel</option>
                                    <option value="sanitary-waste">Tempat Sampah</option>
                                </optgroup>

                                {/* Area Makan */}
                                <optgroup label="Area Makan">
                                    <option value="food-kitchen">Dapur</option>
                                    <option value="food-dining">Ruang Makan</option>
                                    <option value="food-pantry">Pantry</option>
                                </optgroup>

                                {/* Keamanan */}
                                <optgroup label="Keamanan">
                                    <option value="security-cctv">CCTV</option>
                                    <option value="security-gate">Gerbang Sekolah</option>
                                    <option value="security-fence">Pagar Keliling</option>
                                    <option value="security-post">Pos Satpam</option>
                                </optgroup>

                                {/* Fasilitas Umum */}
                                <optgroup label="Fasilitas Umum">
                                    <option value="utility-ac">AC/Pendingin Ruangan</option>
                                    <option value="utility-lighting">Lampu</option>
                                    <option value="utility-parking">Area Parkir</option>
                                    <option value="utility-wifi">WiFi/Internet</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Deskripsi Kondisi
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring-brand-purple"
                                placeholder="Jelaskan kondisi fasilitas secara detail..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Foto Kondisi
                            </label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="relative h-24 w-24">
                                        <Image
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-purple hover:text-brand-purple"
                                >
                                    <FiCamera className="h-6 w-6" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Upload foto untuk dokumentasi kondisi fasilitas
                            </p>
                        </div>

                        {message.text && (
                            <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-md bg-brand-purple px-4 py-2 text-white hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                        </button>
                    </form>
                </div>

                {/* Recent Reports Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Laporan Terbaru</h2>
                    {isLoading ? (
                        <div className="text-center text-gray-500">Memuat data...</div>
                    ) : recentReports.length > 0 ? (
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report._id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{report.facility.name}</h3>
                                            <p className="text-sm text-gray-600">{report.facility.location}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            report.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                                            report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {report.status === 'Open' ? 'Menunggu' :
                                             report.status === 'In Progress' ? 'Diproses' :
                                             'Selesai'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">{report.description}</p>
                                    {report.images && report.images.length > 0 && (
                                        <div className="mt-2 flex gap-2 overflow-x-auto">
                                            {report.images.map((image, index) => (
                                                <div key={index} className="relative h-20 w-20 flex-shrink-0">
                                                    <Image
                                                        src={image}
                                                        alt={`Image ${index + 1}`}
                                                        fill
                                                        className="rounded-lg object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        Dilaporkan pada: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            Belum ada laporan kondisi fasilitas
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
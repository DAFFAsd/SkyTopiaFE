'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useRouter } from 'next/navigation';
import {
    FiArrowLeft, FiSend, FiStar, FiHeart, FiCpu, FiMessageCircle,
    FiActivity, FiEdit2, FiShield, FiPenTool, FiFileText, FiList,
    FiUser, FiCalendar, FiTrash2, FiLoader
    } from 'react-icons/fi';
    import { IconType } from 'react-icons';
import { apiUrl } from '@/lib/api';

    interface Child {
    _id: string;
    name: string;
    }
    interface Teacher {
    _id: string;
    name: string;
    email: string;
    }
    type ChecklistItem = {
    [key: string]: string;
    };
    interface ReportFormData {
    religious_moral: ChecklistItem;
    social_emotional: ChecklistItem;
    cognitive: ChecklistItem;
    language: ChecklistItem;
    gross_motor: ChecklistItem;
    fine_motor: ChecklistItem;
    independence: ChecklistItem;
    art: ChecklistItem;
    teacher_notes: string;
    }
    interface SemesterReport {
        _id: string;
        child_id: Child; 
        teacher_id: Teacher; 
        semester: string;
        createdAt: string;
    }
    interface ReportSection {
    id: keyof ReportFormData | 'teacher_notes';
    title: string;
    icon: IconType;
    bgColor: string;
    iconColor: string;
    enumType: string[];
    keys: string[];
    }

    const KONSISTENSI_OPTIONS = [
    "Belum Konsisten",
    "Konsisten",
    "Tidak Teramati"
    ];
    const BANTUAN_OPTIONS = [
    "Bantuan Fisik",
    "Bantuan Verbal",
    "Mandiri",
    "Tidak Teramati"
    ];

    const reportSections: ReportSection[] = [
    { id: 'religious_moral', title: 'Nilai Agama & Moral', icon: FiStar, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500', enumType: KONSISTENSI_OPTIONS, keys: ['berdoa_sebelum_kegiatan', 'menirukan_sikap_berdoa', 'menyebutkan_ciptaan_tuhan', 'menyayangi_ciptaan_tuhan'] },
    { id: 'social_emotional', title: 'Sosial Emosional', icon: FiHeart, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500', enumType: KONSISTENSI_OPTIONS, keys: ['menyebut_nama_teman', 'sikap_menolong', 'mengucapkan_salam', 'mengucapkan_terimakasih', 'meminta_dan_memberi_maaf', 'berbagi_mainan_makanan', 'menunggu_giliran', 'afeksi_pada_orang_lain', 'rasa_percaya_diri', 'mengungkapkan_keinginan_bak_bab', 'menunjukkan_ekspresi_wajar', 'meminta_izin_pakai_barang', 'berbicara_suara_lembut', 'mengerjakan_tugas_sampai_selesai', 'reaksi_terhadap_orang_baru', 'berinteraksi_dengan_teman', 'sikap_kooperatif', 'memilih_mainan_sendiri'] },
    { id: 'cognitive', title: 'Kognitif', icon: FiCpu, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500', enumType: KONSISTENSI_OPTIONS, keys: ['menyebut_nama_bagian_tubuh', 'menyebut_nama_benda', 'mengelompokkan_benda', 'mengenal_warna_dasar', 'menyusun_puzzle', 'menceritakan_pengalaman', 'membilang_1_5', 'mengenal_bentuk_geometri', 'menyebut_ciri_binatang', 'mengenal_posisi_objek', 'mengenal_gejala_alam', 'mengerjakan_maze', 'bermain_peran', 'menyebut_anggota_tubuh', 'mengenal_rasa_manis_dan_asin'] },
    { id: 'language', title: 'Bahasa', icon: FiMessageCircle, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500', enumType: KONSISTENSI_OPTIONS, keys: ['menyebut_nama_panggilan', 'menyebut_nama_orangtua', 'menyatakan_keinginan', 'menceritakan_tentang_gambar', 'memahami_instruksi_sederhana', 'menjawab_pertanyaan_ya_tidak', 'menjawab_dengan_kalimat_sederhana', 'mendengarkan_dan_menceritakan_kembali', 'menceritakan_pengalaman', 'meniru_kata_kata', 'menggunakan_2_3_kata', 'menggunakan_kata_tanya'] },
    { id: 'gross_motor', title: 'Motorik Kasar', icon: FiActivity, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500', enumType: BANTUAN_OPTIONS, keys: ['naik_tangga', 'turun_tangga', 'berlari_lurus', 'mendorong_menarik_mainan', 'melompat_di_tempat', 'melompat_dari_ketinggian', 'berdiri_satu_kaki', 'berjalan_jinjit', 'menendang_bola', 'melempar_bola', 'menangkap_bola', 'mengikuti_gerakan_sederhana', 'memanjat', 'melompat_dua_kaki', 'menggulirkan_bola', 'berguling_di_matras', 'merangkak_dan_merayap'] },
    { id: 'fine_motor', title: 'Motorik Halus', icon: FiEdit2, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500', enumType: BANTUAN_OPTIONS, keys: ['memindahkan_benda', 'membuka_tutup_gelas', 'meremas_kertas_dan_spons', 'merobek_kertas', 'menyusun_menara_balok', 'membuka_retseleting', 'menutup_retseleting', 'mencoret_bebas', 'membuka_tutup_gunting', 'membalik_halaman_buku', 'melipat_kertas', 'koordinasi_jari_tangan', 'menempel_kertas', 'menggunting_tanpa_pola', 'memegang_krayon', 'menarik_garis', 'memegang_benda_kecil'] },
    { id: 'independence', title: 'Kemandirian', icon: FiShield, bgColor: 'bg-stat-pink-bg', iconColor: 'text-pink-500', enumType: BANTUAN_OPTIONS, keys: ['melepas_sepatu_tak_bertali', 'memakai_sepatu_tak_bertali', 'meletakkan_sandal_tas', 'mengembalikan_mainan', 'memakai_sandal', 'mengeluarkan_tempat_makan', 'memasukkan_tempat_makan', 'mencuci_tangan', 'membuang_sampah', 'menggunakan_sendok', 'menaik_turunkan_celana', 'menyuap_makanan_sendiri', 'minum_dari_gelas', 'duduk_tenang_saat_makan', 'bak_bab_di_kloset', 'menyikat_gigi_dengan_bantuan', 'melepas_baju_tanpa_kancing', 'memasukkan_tangan_ke_baju', 'memasukkan_kaki_ke_celana'] },
    { id: 'art', title: 'Seni', icon: FiPenTool, bgColor: 'bg-stat-blue-bg/50', iconColor: 'text-blue-500', enumType: BANTUAN_OPTIONS, keys: ['menari_mengikuti_irama', 'membuat_coretan_dengan_kuas', 'membuat_bentuk_plastisin', 'bernyanyi_lagu'] },
    { id: 'teacher_notes', title: 'Catatan Guru', icon: FiFileText, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', enumType: [], keys: [] },
    ];

    const formatKeyName = (key: string) => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const initialReportData: ReportFormData = {
    religious_moral: {
        berdoa_sebelum_kegiatan: "Belum Konsisten",
        menirukan_sikap_berdoa: "Belum Konsisten",
        menyebutkan_ciptaan_tuhan: "Belum Konsisten",
        menyayangi_ciptaan_tuhan: "Belum Konsisten"
    },
    social_emotional: {
        menyebut_nama_teman: "Belum Konsisten",
        sikap_menolong: "Belum Konsisten",
        mengucapkan_salam: "Belum Konsisten",
        mengucapkan_terimakasih: "Belum Konsisten",
        meminta_dan_memberi_maaf: "Belum Konsisten",
        berbagi_mainan_makanan: "Belum Konsisten",
        menunggu_giliran: "Belum Konsisten",
        afeksi_pada_orang_lain: "Belum Konsisten",
        rasa_percaya_diri: "Belum Konsisten",
        mengungkapkan_keinginan_bak_bab: "Belum Konsisten",
        menunjukkan_ekspresi_wajar: "Belum Konsisten",
        meminta_izin_pakai_barang: "Belum Konsisten",
        berbicara_suara_lembut: "Belum Konsisten",
        mengerjakan_tugas_sampai_selesai: "Belum Konsisten",
        reaksi_terhadap_orang_baru: "Belum Konsisten",
        berinteraksi_dengan_teman: "Belum Konsisten",
        sikap_kooperatif: "Belum Konsisten",
        memilih_mainan_sendiri: "Belum Konsisten"
    },
    cognitive: {
        menyebut_nama_bagian_tubuh: "Belum Konsisten",
        menyebut_nama_benda: "Belum Konsisten",
        mengelompokkan_benda: "Belum Konsisten",
        mengenal_warna_dasar: "Belum Konsisten",
        menyusun_puzzle: "Belum Konsisten",
        menceritakan_pengalaman: "Belum Konsisten",
        membilang_1_5: "Belum Konsisten",
        mengenal_bentuk_geometri: "Belum Konsisten",
        menyebut_ciri_binatang: "Belum Konsisten",
        mengenal_posisi_objek: "Belum Konsisten",
        mengenal_gejala_alam: "Belum Konsisten",
        mengerjakan_maze: "Belum Konsisten",
        bermain_peran: "Belum Konsisten",
        menyebut_anggota_tubuh: "Belum Konsisten",
        mengenal_rasa_manis_dan_asin: "Belum Konsisten"
    },
    language: {
        menyebut_nama_panggilan: "Belum Konsisten",
        menyebut_nama_orangtua: "Belum Konsisten",
        menyatakan_keinginan: "Belum Konsisten",
        menceritakan_tentang_gambar: "Belum Konsisten",
        memahami_instruksi_sederhana: "Belum Konsisten",
        menjawab_pertanyaan_ya_tidak: "Belum Konsisten",
        menjawab_dengan_kalimat_sederhana: "Belum Konsisten",
        mendengarkan_dan_menceritakan_kembali: "Belum Konsisten",
        menceritakan_pengalaman: "Belum Konsisten",
        meniru_kata_kata: "Belum Konsisten",
        menggunakan_2_3_kata: "Belum Konsisten",
        menggunakan_kata_tanya: "Belum Konsisten"
    },
    gross_motor: {
        naik_tangga: "Tidak Teramati",
        turun_tangga: "Tidak Teramati",
        berlari_lurus: "Tidak Teramati",
        mendorong_menarik_mainan: "Tidak Teramati",
        melompat_di_tempat: "Tidak Teramati",
        melompat_dari_ketinggian: "Tidak Teramati",
        berdiri_satu_kaki: "Tidak Teramati",
        berjalan_jinjit: "Tidak Teramati",
        menendang_bola: "Tidak Teramati",
        melempar_bola: "Tidak Teramati",
        menangkap_bola: "Tidak Teramati",
        mengikuti_gerakan_sederhana: "Tidak Teramati",
        memanjat: "Tidak Teramati",
        melompat_dua_kaki: "Tidak Teramati",
        menggulirkan_bola: "Tidak Teramati",
        berguling_di_matras: "Tidak Teramati",
        merangkak_dan_merayap: "Tidak Teramati"
    },
    fine_motor: {
        memindahkan_benda: "Tidak Teramati",
        membuka_tutup_gelas: "Tidak Teramati",
        meremas_kertas_dan_spons: "Tidak Teramati",
        merobek_kertas: "Tidak Teramati",
        menyusun_menara_balok: "Tidak Teramati",
        membuka_retseleting: "Tidak Teramati",
        menutup_retseleting: "Tidak Teramati",
        mencoret_bebas: "Tidak Teramati",
        membuka_tutup_gunting: "Tidak Teramati",
        membalik_halaman_buku: "Tidak Teramati",
        melipat_kertas: "Tidak Teramati",
        koordinasi_jari_tangan: "Tidak Teramati",
        menempel_kertas: "Tidak Teramati",
        menggunting_tanpa_pola: "Tidak Teramati",
        memegang_krayon: "Tidak Teramati",
        menarik_garis: "Tidak Teramati",
        memegang_benda_kecil: "Tidak Teramati"
    },
    independence: {
        melepas_sepatu_tak_bertali: "Tidak Teramati",
        memakai_sepatu_tak_bertali: "Tidak Teramati",
        meletakkan_sandal_tas: "Tidak Teramati",
        mengembalikan_mainan: "Tidak Teramati",
        memakai_sandal: "Tidak Teramati",
        mengeluarkan_tempat_makan: "Tidak Teramati",
        memasukkan_tempat_makan: "Tidak Teramati",
        mencuci_tangan: "Tidak Teramati",
        membuang_sampah: "Tidak Teramati",
        menggunakan_sendok: "Tidak Teramati",
        menaik_turunkan_celana: "Tidak Teramati",
        menyuap_makanan_sendiri: "Tidak Teramati",
        minum_dari_gelas: "Tidak Teramati",
        duduk_tenang_saat_makan: "Tidak Teramati",
        bak_bab_di_kloset: "Tidak Teramati",
        menyikat_gigi_dengan_bantuan: "Tidak Teramati",
        melepas_baju_tanpa_kancing: "Tidak Teramati",
        memasukkan_tangan_ke_baju: "Tidak Teramati",
        memasukkan_kaki_ke_celana: "Tidak Teramati"
    },
    art: {
        menari_mengikuti_irama: "Tidak Teramati",
        membuat_coretan_dengan_kuas: "Tidak Teramati",
        membuat_bentuk_plastisin: "Tidak Teramati",
        bernyanyi_lagu: "Tidak Teramati"
    },
    teacher_notes: ""
    };

    export default function CreateSemesterReportPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();
    const [children, setChildren] = useState<Child[]>([]);
    const [myReports, setMyReports] = useState<SemesterReport[]>([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [semester, setSemester] = useState(''); 
    const [activeSection, setActiveSection] = useState('religious_moral'); 
    
    const [formData, setFormData] = useState<ReportFormData>(initialReportData);
    
    const [isLoadingChildren, setIsLoadingChildren] = useState(true);
    const [isLoadingReports, setIsLoadingReports] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); 

    const fetchChildren = useCallback(async (token: string) => {
        setIsLoadingChildren(true);
        try {
        const response = await fetch(apiUrl('/children'), { 
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
            setChildren(data.children);
            if (data.children.length > 0) {
            setSelectedChild(data.children[0]._id);
            }
        } else {
            throw new Error(data.message || 'Gagal mengambil data anak');
        }
        } catch (err: unknown) { 
        let errorMessage = "Gagal fetch data anak";
        if (err instanceof Error) errorMessage = err.message;
        setMessage({ type: 'error', text: errorMessage });
        } finally {
        setIsLoadingChildren(false);
        }
    }, []);

    const fetchMyReports = useCallback(async (token: string) => {
        setIsLoadingReports(true);
        try {
        const response = await fetch(apiUrl('/semester-reports/my-reports'), {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
            const sortedReports = data.reports.sort((a: SemesterReport, b: SemesterReport) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setMyReports(sortedReports);
        } else {
            throw new Error(data.message || 'Gagal mengambil laporan');
        }
        } catch (err: unknown) { 
        let errorMessage = "Gagal fetch laporan";
        if (err instanceof Error) errorMessage = err.message;
        setMessage({ type: 'error', text: errorMessage });
        } finally {
        setIsLoadingReports(false);
        }
    }, []);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage({ type: 'error', text: 'Token tidak ditemukan' });
            return;
        }
        fetchChildren(token);
        fetchMyReports(token);
    }, [fetchChildren, fetchMyReports]);

    const handleChecklistChange = (section: keyof ReportFormData, key: string, value: string) => {
        setFormData(prev => ({
        ...prev,
        [section]: {
            ...(prev[section] as ChecklistItem),
            [key]: value
        }
        }));
    };
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({
        ...prev,
        teacher_notes: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedChild) {
        setMessage({ type: 'error', text: 'Silakan pilih anak terlebih dahulu.'}); return;
        }
        if (!semester.match(/^\d{4}-[12]$/)) {
        setMessage({ type: 'error', text: 'Format semester salah. Contoh: 2025-1 atau 2025-2'}); return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan');

        const body = {
            child_id: selectedChild,
            semester: semester,
            ...formData
        };
        
        const response = await fetch(apiUrl('/semester-reports'), {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (data.success) {
            setMessage({ type: 'success', text: 'Laporan semester berhasil dibuat!' });
            setFormData(initialReportData); 
            fetchMyReports(token); 
        } else {
            throw new Error(data.message || 'Gagal membuat laporan');
        }

        } catch (err: unknown) { 
        let errorMessage = "Terjadi kesalahan tidak terduga.";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        setMessage({ type: 'error', text: errorMessage });
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleDelete = async (reportId: string) => {
        if (!confirm('Yakin mau hapus laporan semester ini?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await fetch(apiUrl(`/semester-reports/${reportId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                alert('Laporan berhasil dihapus');
                setMyReports(prev => prev.filter(r => r._id !== reportId));
            } else {
                throw new Error(data.message || 'Gagal menghapus laporan');
            }
        } catch (err: unknown) {
            let errorMessage = "Gagal menghapus";
            if (err instanceof Error) errorMessage = err.message;
            alert(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
        <Link
            href="/teacherDashboard"
            className="flex items-center space-x-2 text-sm text-brand-purple hover:underline"
        >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dasbor</span>
        </Link>

        <PageHeader title="Buat Laporan Semester" description="Evaluasi perkembangan anak semester ini" />
        
        <form onSubmit={handleSubmit}>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label htmlFor="child-select" className="block text-sm font-semibold text-brand-purple mb-2">
                    <FiUser className="h-4 w-4 inline mr-1" />
                    Pilih Anak
                </label>
                {isLoadingChildren ? <div className="text-sm text-gray-500">Memuat data anak...</div> : (
                    <select
                    id="child-select"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                    required
                    >
                    <option value="" disabled>Pilih salah satu anak</option>
                    {children.map((child) => (
                        <option key={child._id} value={child._id}>
                        {child.name}
                        </option>
                    ))}
                    </select>
                )}
                </div>
                
                <div>
                    <label htmlFor="semester-input" className="block text-sm font-semibold text-brand-purple mb-2">
                        <FiCalendar className="h-4 w-4 inline mr-1" />
                        Semester (Format: YYYY-1)
                    </label>
                    <input
                        id="semester-input"
                        type="text"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="Contoh: 2025-1"
                        required
                        className="w-full rounded-lg border-brand-purple/30 shadow-sm focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                    />
                </div>
            </div>
            </div>

            <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {reportSections.map((section) => (
                <button
                    type="button" 
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-4 rounded-lg p-4 text-left transition-all hover:shadow-lg
                    ${activeSection === section.id 
                        ? 'shadow-lg scale-105 border-2 border-login-pink' 
                        : 'shadow-sm'
                    }
                    ${section.bgColor}
                    `}
                >
                    <div className={`rounded-full p-3 ${section.iconColor} bg-white`}>
                    <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                    <div className="text-sm font-semibold text-brand-purple">{section.title}</div>
                    </div>
                </button>
                ))}
            </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            {reportSections.map((section) => (
                <div key={section.id} className={activeSection === section.id ? 'block' : 'hidden'}>
                
                {section.id !== 'teacher_notes' ? (
                    <ChecklistFormSection
                    title={section.title}
                    sectionKey={section.id as keyof ReportFormData}
                    itemKeys={section.keys}
                    enumOptions={section.enumType}
                    formData={formData}
                    handleChange={handleChecklistChange}
                    />
                ) : (
                    <div>
                    <h3 className="text-xl font-bold text-brand-purple border-b border-gray-200 pb-3 mb-4">
                        Catatan Akhir Guru
                    </h3>
                    <textarea
                        value={formData.teacher_notes}
                        onChange={handleNotesChange}
                        rows={6}
                        className="w-full rounded-lg border-gray-300 focus:border-login-pink focus:ring-1 focus:ring-login-pink transition-colors"
                        placeholder="Tulis ringkasan umum, saran, atau hal-hal positif tentang perkembangan anak..."
                    />
                    </div>
                )}
                </div>
            ))}
            </div>
            
            {message.text && (
                <div className={`rounded-md p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-8 flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting || isLoadingChildren}
                className="flex items-center justify-center rounded-lg bg-login-pink py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none
                        disabled:cursor-not-allowed disabled:bg-pink-300"
            >
                {isSubmitting ? <FiLoader className="h-5 w-5 animate-spin" /> : <FiSend className="h-5 w-5 mr-2" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Semester'}
            </button>
            </div>
            
        </form>
        
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-bold text-brand-purple">
                <FiList className="h-5 w-5 inline mr-2" />
                Laporan Semester Dibuat
            </h2>
            {isLoadingReports ? (
                <div className="text-center text-gray-500">Memuat laporan...</div>
            ) : myReports.length > 0 ? (
                <div className="space-y-3">
                    {myReports.slice(0, 5).map((report) => (
                        <div key={report._id} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-brand-purple">{report.child_id.name}</h3>
                                <p className="text-sm text-gray-600">
                                    Semester: {report.semester}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Dibuat pada: {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(report._id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                aria-label="Hapus laporan"
                            >
                                <FiTrash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    Belum ada laporan semester yang dibuat.
                </div>
            )}
        </div>

        </div>
    );
    }

    interface ChecklistFormProps {
    title: string;
    sectionKey: keyof ReportFormData;
    itemKeys: string[];
    enumOptions: string[];
    formData: ReportFormData;
    handleChange: (section: keyof ReportFormData, key: string, value: string) => void;
    }

    function ChecklistFormSection({ title, sectionKey, itemKeys, enumOptions, formData, handleChange }: ChecklistFormProps) {
    
    const sectionData = formData[sectionKey] as ChecklistItem; 
    
    return (
        <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-purple border-b border-gray-200 pb-3 mb-4">
            {title}
        </h3>
        
        {itemKeys.map((key) => (
            <RadioInputGroup
            key={key}
            label={formatKeyName(key)}
            options={enumOptions}
            currentValue={sectionData ? sectionData[key] : ''} // <-- Tambah cek 'sectionData'
            onChange={(value) => handleChange(sectionKey, key, value)}
            />
        ))}
        </div>
    );
    }

    interface RadioInputProps {
    label: string;
    options: string[];
    currentValue: string;
    onChange: (value: string) => void;
    }

    function RadioInputGroup({ label, options, currentValue, onChange }: RadioInputProps) {
    return (
        <div className="py-3 border-b border-gray-100 sm:flex sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
            {options.map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                type="radio"
                name={`${label}-radio`}
                value={option}
                checked={currentValue === option}
                onChange={(e) => onChange(e.target.value)}
                className="
                    h-4 w-4
                    text-login-pink 
                    border-gray-300
                    focus:ring-login-pink focus:ring-offset-0 focus:ring-2
                "
                />
                <span className={`text-sm ${currentValue === option ? 'font-semibold text-login-pink' : 'text-gray-600'}`}>
                {option}
                </span>
            </label>
            ))}
        </div>
        </div>
    );
}
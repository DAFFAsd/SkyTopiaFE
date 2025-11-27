'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiFileText } from 'react-icons/fi';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [rememberMe, setRememberMe] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true); 
        }
        
        if (savedPassword) {
            setPassword(savedPassword); 
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (rememberMe) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedPassword', password); 
        } else {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
        }

        const API_URL = 'http://localhost:3000/api/users/login';

        try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Login gagal. Periksa email atau password.');
        }

        console.log('Login successful:', data);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const userRole = data.user.role;

        if (userRole === 'Admin') {
            router.push('/adminDashboard'); 
        } else if (userRole === 'Teacher') {
            router.push('/teacherDashboard'); 
        } else if (userRole === 'Parent') {
            router.push('/parentDashboard'); 
        } else {
            localStorage.clear(); 
            setError('Role pengguna tidak dikenal.');
        }

        } catch (err: unknown) {
        let errorMessage = "Terjadi kesalahan tidak terduga.";

        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }

        setError(errorMessage);
        console.error(err);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
        
        {/* --- LEFT PANEL (DESKTOP ONLY) --- */}
        <div className="hidden pb-0 md:flex md:w-6/12 flex-col justify-center items-center bg-new-sky-blue p-12 text-brand-purple relative">
            <div className="absolute top-12 left-20">
            <Image
                src="/sun.svg"
                alt="Ilustrasi Matahari"
                width={50}
                height={50}
            />
            </div>

            <div className="max-w-sm">
            <h2 className="font-rammetto text-4xl mt-20 mb-6">
                Berikan Perawatan Terbaik
                Untuk Anak Anda
            </h2>
            <p className="font-poppins text-md opacity-90">
                Solusi digital terpercaya untuk memantau aktivitas dan perkembangan buah hati Anda.
            </p>
            </div>
            <div className="mt-10">
            <Image
                src="/children.svg"
                alt="Ilustrasi Anak-anak"
                width={300}
                height={200}
            />
            </div>
        </div>

        {/* --- RIGHT PANEL (FORM) --- */}
        {/* UBAH DISINI: Tambah flex-col, bg-new-sky-blue (mobile), md:bg-white (desktop) */}
        <div className="w-full md:w-7/12 flex flex-col justify-center items-center bg-new-sky-blue md:bg-white p-8 relative">
            
            {/* Tambah bg-white di sini supaya kotaknya putih saat background mobile jadi biru */}
            <div className="w-full max-w-md rounded-2xl bg-white border border-form-stroke/15 p-10 shadow-xl z-10">
            <div className="flex justify-center mb-8">
                <Image
                src="/skytopia-logo.svg"
                alt="Logo SkyTopia"
                width={220}
                height={74}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email
                </label>
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pt-1 pb-1 pl-3">
                    <FiMail
                        className="h-5 w-5 text-gray-400 transition-colors duration-150 group-hover:text-login-pink group-focus-within:text-login-pink"
                    />
                    </span>
                    <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username" 
                    className="block w-full rounded-lg border-form-stroke pl-10 shadow-sm transition-colors duration-150 group-hover:border-login-pink-focus focus:border-login-pink-focus focus:ring-2 focus:ring-login-pink-focus"
                    />
                </div>
                </div>

                <div className="mb-4">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Kata Sandi 
                </label>
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiLock
                        className="h-5 w-5 text-gray-400 transition-colors duration-150 group-hover:text-login-pink group-focus-within:text-login-pink"
                    />
                    </span>
                    <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-lg border-form-stroke pl-10 shadow-sm transition-colors duration-150 group-hover:border-login-pink-focus focus:border-login-pink-focus focus:ring-2 focus:ring-login-pink-focus"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                    {showPassword ? (
                        <FiEyeOff
                        className="h-5 w-5 text-gray-400 transition-colors duration-150 group-hover:text-login-pink group-focus-within:text-login-pink"
                        />
                    ) : (
                        <FiEye
                        className="h-5 w-5 text-gray-400 transition-colors duration-150 group-hover:text-login-pink group-focus-within:text-login-pink"
                        />
                    )}
                    </button>
                </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-login-pink focus:ring-login-pink"
                    />
                    <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900 cursor-pointer"
                    >
                    Ingat saya 
                    </label>
                </div>
                </div>
                {error && (
                <div className="mb-4 text-center text-sm text-red-600">
                    {error}
                </div>
                )}

                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-lg bg-login-pink py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none
                            disabled:cursor-not-allowed disabled:bg-pink-300"
                >
                    {isLoading ? 'Sedang masuk...' : 'Masuk'}
                </button>
                </div>

                <p className="mt-10 text-center text-xs text-gray-400">
                Dengan masuk ke SkyTopia, Anda setuju dengan{' '}
                <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-medium underline text-login-pink hover:text-pink-700 transition-colors"
                >
                    ketentuan layanan kami.
                </button>
                </p>
            </form>
            </div>

            {/* --- GAMBAR UNTUK MOBILE (BAWAH FORM) --- */}
            {/* Class 'block md:hidden' artinya muncul di mobile, hilang di desktop */}
            <div className="mt-8 block md:hidden animate-fade-in-up">
                <Image
                    src="/children.svg"
                    alt="Ilustrasi Anak-anak"
                    width={280}
                    height={180}
                    className="opacity-90"
                />
            </div>

            {/* --- MODAL KETENTUAN LAYANAN --- */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <FiFileText className="text-brand-purple h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Ketentuan Layanan</h3>
                            </div>
                            <button 
                                onClick={() => setShowTermsModal(false)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto text-gray-600 text-sm leading-relaxed space-y-4 custom-scrollbar">
                            <p className="font-semibold">Selamat datang di SkyTopia Daycare.</p>
                            <p>
                                Harap membaca ketentuan layanan ini dengan saksama sebelum menggunakan layanan kami. Dengan mendaftarkan anak Anda, Anda menyetujui poin-poin berikut:
                            </p>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-purple text-base">1. Jam Operasional & Penjemputan</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Daycare beroperasi mulai pukul 07.00 hingga 17.00 WIB, Senin sampai Jumat.</li>
                                    <li>Keterlambatan penjemputan di atas pukul 17.00 akan dikenakan biaya tambahan (overtime) sebesar Rp 50.000/jam.</li>
                                    <li>Anak hanya boleh dijemput oleh orang tua atau wali yang terdaftar dalam sistem. Penjemputan oleh pihak lain wajib mengonfirmasi kepada admin minimal 1 jam sebelumnya.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-purple text-base">2. Kesehatan & Keamanan</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Anak yang sedang sakit menular (demam tinggi, cacar air, flu berat, mata merah) <strong>dilarang masuk</strong> demi kesehatan anak lainnya.</li>
                                    <li>Orang tua wajib menginformasikan riwayat alergi anak (makanan/obat) saat pendaftaran.</li>
                                    <li>Obat-obatan pribadi wajib diserahkan ke pengasuh dengan instruksi tertulis yang jelas.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-purple text-base">3. Pembayaran & Administrasi</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Tagihan bulanan (SPP) wajib dibayarkan paling lambat tanggal 5 setiap bulannya.</li>
                                    <li>Keterlambatan pembayaran lebih dari 7 hari akan dikenakan denda administrasi.</li>
                                    <li>Biaya pendaftaran dan deposit tidak dapat dikembalikan jika terjadi pembatalan sepihak.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-purple text-base">4. Privasi & Dokumentasi</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>SkyTopia berhak mendokumentasikan kegiatan anak (foto/video) untuk keperluan laporan harian kepada orang tua.</li>
                                    <li>Penggunaan foto anak untuk materi promosi media sosial SkyTopia akan meminta izin tertulis terpisah dari orang tua.</li>
                                    <li>Data pribadi anak dan orang tua tersimpan aman dalam sistem enkripsi kami dan tidak akan dibagikan ke pihak ketiga.</li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="italic text-xs text-gray-400">Terakhir diperbarui: November 2025</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="bg-brand-purple text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-md"
                            >
                                Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
        </div>
    );
}
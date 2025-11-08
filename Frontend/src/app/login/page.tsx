'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Pastiin ini port backend lo (3000)
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

        // ==========================================================
        // --- LOGIKA REDIRECT BERDASARKAN ROLE (INI YANG BARU) ---
        // ==========================================================
        const userRole = data.user.role;

        if (userRole === 'Admin') {
            router.push('/adminDashboard'); // Ke dasbor Admin
        } else if (userRole === 'Teacher') {
            router.push('/teacherDashboard'); // Ke dasbor Guru
        } else if (userRole === 'Parent') {
            router.push('/parentDashboard'); // Ke dasbor Orang Tua
        } else {
            // Fallback kalo role-nya aneh
            localStorage.clear(); // Bersihin login yang gagal
            setError('Role pengguna tidak dikenal.');
        }
        // ==========================================================

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
        {/* Bagian Kiri */}
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

        {/* Bagian Kanan */}
        <div className="w-full md:w-7/12 flex justify-center items-center bg-white p-8">
            <div className="w-full max-w-md rounded-2xl border border-form-stroke/15 p-10 shadow-xl">
            <div className="flex justify-center mb-8">
                <Image
                src="/skytopia-logo.svg"
                alt="Logo SkyTopia"
                width={220}
                height={74}
                />
            </div>

            <form onSubmit={handleSubmit}>
                {/* Input Email */}
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
                    className="block w-full rounded-lg border-form-stroke pl-10 shadow-sm transition-colors duration-150 group-hover:border-login-pink-focus focus:border-login-pink-focus focus:ring-2 focus:ring-login-pink-focus"
                    />
                </div>
                </div>

                {/* Input Password */}
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

                {/* Remember Me */}
                <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-login-pink focus:ring-login-pink"
                    />
                    <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
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

                {/* Tombol Login */}
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

                {/* Terms of Service */}
                <p className="mt-10 text-center text-xs text-gray-400">
                Dengan masuk ke SkyTopia, Anda setuju dengan{' '}
                <Link href="#" className="font-medium underline">
                    ketentuan layanan kami.
                </Link>
                </p>
            </form>
            </div>
        </div>
        </div>
    );
}
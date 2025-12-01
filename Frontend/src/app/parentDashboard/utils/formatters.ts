// Utility functions untuk formatting data

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateWithDay(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTime(time?: string | null): string {
    // Safely handle undefined/null and remove seconds (HH:mm:ss -> HH:mm)
    if (!time || typeof time !== 'string') return '-';
    return time.replace(/:\d{2}$/, '');
}

export function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'Dibayar': 'bg-green-100 text-green-800',
        'Terkirim': 'bg-blue-100 text-blue-800',
        'Tertunda': 'bg-yellow-100 text-yellow-800',
        'Ditolak': 'bg-red-100 text-red-800',
        'Jatuh Tempo': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getHealthStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'Good': 'bg-green-100 text-green-800',
        'Sick': 'bg-red-100 text-red-800',
        'Tired': 'bg-yellow-100 text-yellow-800',
        'Energetic': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getMoodColor(mood: string): string {
    const colors: Record<string, string> = {
        'Happy': 'bg-yellow-100 text-yellow-800',
        'Sad': 'bg-gray-100 text-gray-800',
        'Calm': 'bg-blue-100 text-blue-800',
        'Excited': 'bg-pink-100 text-pink-800',
        'Irritable': 'bg-red-100 text-red-800',
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
}

export function translateHealthStatus(status: string): string {
    const translations: Record<string, string> = {
        'Good': 'Baik',
        'Sick': 'Sakit',
        'Tired': 'Lelah',
        'Energetic': 'Enerjik',
    };
    return translations[status] || status;
}

export function translateMood(mood: string): string {
    const translations: Record<string, string> = {
        'Happy': 'Bahagia',
        'Sad': 'Sedih',
        'Calm': 'Tenang',
        'Excited': 'Bergairah',
        'Irritable': 'Mudah Marah',
    };
    return translations[mood] || mood;
}

export function translateGender(gender: string): string {
    return gender === 'Male' ? 'Laki-laki' : 'Perempuan';
}

// Loading Spinner Component
export default function LoadingSpinner({ message = 'Memuat data...' }: { message?: string }) {
    return (
        <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent"></div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
}

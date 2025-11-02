// app/dashboard/layout.tsx
import Sidebar from './components/Sidebar';

export default function DashboardLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-8">
            <div className="mb-6">
            </div>
            {children}
        </main>
        </div>
    );
}
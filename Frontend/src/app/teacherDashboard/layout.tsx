// Import Image, FiSearch, dan FiBell udah dihapus
import TeacherSidebar from './components/Sidebar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
        <TeacherSidebar />
        
        {/* DIV pembungkus <header> dan <main> udah dihapus.
            <main> sekarang jadi anak langsung dari <div flex ...>
        */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
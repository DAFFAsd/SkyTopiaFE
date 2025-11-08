// Import Image, FiSearch, dan FiBell udah dihapus
import ParentSidebar from './components/Sidebar';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
        <ParentSidebar />
        
        {/* DIV pembungkus <header> dan <main> udah dihapus.
            <main> sekarang jadi anak langsung dari <div flex ...>
        */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
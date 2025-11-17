// Delete Confirmation Modal Component
'use client';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    childName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    childName,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Konfirmasi Hapus
                </h2>
                
                <p className="text-gray-600 mb-6">
                    Apakah Anda yakin ingin menghapus data anak <strong>{childName}</strong>? 
                    Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

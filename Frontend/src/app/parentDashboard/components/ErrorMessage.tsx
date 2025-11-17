// Error Message Component
import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-center space-x-2">
                <FiAlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{message}</p>
            </div>
        </div>
    );
}

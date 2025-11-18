import { redirect } from 'next/navigation';

export default function AdminDailyReportsPageRedirect() {
    // Redirect permanently to the consolidated reports page
    redirect('/adminDashboard/reports');
}
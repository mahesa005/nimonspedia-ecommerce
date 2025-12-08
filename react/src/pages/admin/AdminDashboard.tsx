// src/pages/admin/AdminDashboardPage.tsx
import { useRequireAdmin } from "../../hooks/useRequireAdmin";

export default function AdminDashboard() {
  const { admin, loading } = useRequireAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* sidebar, dll */}
      <aside className="w-64 bg-slate-900 text-white p-4">
        <div className="font-bold text-xl mb-4">Admin Panel</div>
        <div className="text-xs text-slate-300">Logged in as {admin.name}</div>
      </aside>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {/* nanti isi cards, stats, dsb */}
      </main>
    </div>
  );
}

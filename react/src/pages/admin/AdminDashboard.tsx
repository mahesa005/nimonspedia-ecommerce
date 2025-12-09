import { useRequireAdmin } from "../../hooks/useRequireAdmin";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AdminNavbar from "../../components/admin/adminNavbar";
import { useState, useEffect, useRef } from "react";
import { fetchUsersAdmin, type UserData } from "../../api/adminApi";

export default function AdminDashboard() {
  const { admin, loading: authLoading } = useRequireAdmin();
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (token) {
      loadUsers(1, 12);
    }
  }, [token]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      loadUsers(1, pagination?.limit || 12, search);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setShowRoleDropdown(false);
    loadUsers(1, pagination?.limit || 12, search);
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    loadUsers(1, pagination?.limit || 12, "");
  };

  const getFilteredUsers = () => {
    if (!roleFilter) return users;
    return users.filter(user => user.role === roleFilter);
  };

  const loadUsers = async (page: number, limit: number, searchQuery?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchUsersAdmin(page, limit, token, searchQuery);
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    loadUsers(1, newLimit, search);
  };

  const handlePageChange = (newPage: number) => {
    loadUsers(newPage, pagination?.limit || 12, search);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const roleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SELLER":
        return "bg-blue-100 text-blue-800";
      case "BUYER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Kelola Pengguna</h1>
              <p className="text-gray-600">Kelola dan pantau semua pengguna sistem</p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-72">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cari:
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama atau Email Pengguna"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#42b549] focus:ring-1 focus:ring-[#42b549]"
                />
              </div>

              {/* Role Filter Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {roleFilter ? `Role: ${roleFilter}` : "Filter"}
                </button>

                {showRoleDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg min-w-48 border border-gray-200 z-50">
                    <button
                      onClick={() => handleRoleFilterChange("")}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        roleFilter === ""
                          ? "bg-[#42b549] text-white"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Semua Role
                    </button>
                    <button
                      onClick={() => handleRoleFilterChange("ADMIN")}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors border-t border-gray-200 ${
                        roleFilter === "ADMIN"
                          ? "bg-red-50 text-red-800"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ADMIN
                    </button>
                    <button
                      onClick={() => handleRoleFilterChange("SELLER")}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors border-t border-gray-200 ${
                        roleFilter === "SELLER"
                          ? "bg-blue-50 text-blue-800"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      SELLER
                    </button>
                    <button
                      onClick={() => handleRoleFilterChange("BUYER")}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors border-t border-gray-200 ${
                        roleFilter === "BUYER"
                          ? "bg-green-50 text-green-800"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      BUYER
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200 ml-auto"
              >
                Kelola Global Flags
              </button>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Daftar Pengguna</h2>
              </div>
              <span className="text-sm text-gray-600 font-semibold">
                {pagination?.total || 0} pengguna
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-600">
                <div className="inline-block animate-spin">
                  <svg
                    className="w-8 h-8 text-[#42b549]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 7a4 4 0 11-8 0 4 4 0 018 0zM6 17c-1.657 0-3 .895-3 2v2h4V19c0-1.105-1.343-2-3-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak ada pengguna</h3>
                <p>Belum ada pengguna yang sesuai dengan pencarian Anda</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Terdaftar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(users) && getFilteredUsers().map((user) => (
                        <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#42b549]">
                            #{user.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${roleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Rp {user.balance.toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="px-4 py-2 bg-[#42b549] text-white font-semibold text-sm rounded-lg hover:bg-[#329439] transition-colors duration-200 inline-flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Kelola Flags
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700">Tampilkan:</label>
                      <select
                        value={pagination?.limit || 12}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#42b549] focus:ring-1 focus:ring-[#42b549]"
                      >
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="12">12</option>
                        <option value="16">16</option>
                        <option value="20">20</option>
                      </select>
                    </div>

                    <div className="text-sm text-gray-600 font-semibold text-center">
                      Menampilkan{" "}
                      {pagination ? (pagination.page - 1) * (pagination.limit || 12) + 1 : 0} hingga{" "}
                      {pagination ? Math.min(
                        pagination.page * (pagination.limit || 12),
                        pagination.total
                      ) : 0}{" "}
                      dari {pagination?.total || 0}
                    </div>

                    <div className="flex gap-1 justify-center sm:justify-end flex-wrap">
                      {pagination && pagination.page > 1 && (
                        <button
                          onClick={() => handlePageChange((pagination.page || 1) - 1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          ← Prev
                        </button>
                      )}

                      {pagination && Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              (pagination.page || 1) === page
                                ? "bg-[#42b549] text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      {pagination && (pagination.page || 1) < (pagination.totalPages || 1) && (
                        <button
                          onClick={() => handlePageChange((pagination.page || 1) + 1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

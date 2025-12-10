import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useState, useRef, useEffect } from "react";

export default function AdminNavbar() {
  const { admin, logout } = useAdminAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateName = (name?: string, maxLength: number = 20) => {
    if (!name) return "Admin";
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  };

  return (
    <header>
      <nav className="fixed top-0 left-0 w-full h-16 bg-white flex items-center justify-between z-1000 border-b border-gray-200 px-8 box-border shadow-sm">
        <a
          href="/admin"
          className="text-3xl font-extrabold text-[#42b549] no-underline transition-colors duration-300 hover:text-[#329439] shrink-0"
        >
          Nimonspedia
        </a>

        <div className="flex items-center gap-6 ml-auto">
          {/* Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              title={admin?.name || "Admin"}
            >
              {/* Avatar Circle */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#42b549] to-[#329439] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {getInitials(admin?.name)}
              </div>

              {/* Name */}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900">
                  {truncateName(admin?.name, 15)}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg min-w-72 p-0 z-1001 border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                {/* Profile Info */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#42b549] to-[#329439] text-white font-bold text-lg flex items-center justify-center shrink-0">
                      {getInitials(admin?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {admin?.name || "Admin"}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {admin?.email || ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 font-semibold cursor-pointer text-sm hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

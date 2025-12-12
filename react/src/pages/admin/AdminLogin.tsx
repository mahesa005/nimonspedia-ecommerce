// src/pages/admin/AdminLoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);

      // token + admin sudah disimpan via adminLoginAndStore di service
      // + state di context juga sudah ke-update
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Kredensial invalid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="fixed top-0 w-full h-16 bg-white flex items-center justify-center z-1000">
        <nav>
          <a
            href="/"
            className="text-[2rem] font-extrabold text-[#42b549] no-underline transition-colors duration-300 hover:text-[#329439]"
          >
            Nimonspedia
          </a>
        </nav>
      </header>

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen pt-16">
        {/* auth-content */}
        <div className="flex flex-col bg-white rounded-lg p-8 shadow-[0_2px_8px_rgba(0,0,0,0.15)] w-full max-w-[480px]">
          {/* label-container */}
          <div className="flex flex-row justify-between items-end mb-4 w-full">
            <div className="font-extrabold text-lg">Masuk ke Nimonspedia</div>
            <a href="/register" className="text-[#42b549] no-underline hover:underline">
              Daftar
            </a>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* forms-container */}
          <form onSubmit={handleSubmit}>
            {/* Email - forms */}
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 font-semibold text-[#333]">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full border border-[#ccc] rounded-lg py-2.5 px-2.5 text-base transition-[border-color,box-shadow] duration-200 block box-border focus:border-[#42b549] focus:outline-none"
                placeholder="nimons@gro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Password - forms password-wrapper */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block mb-1 font-semibold text-[#333]">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full border border-[#ccc] rounded-lg py-2.5 px-2.5 text-base transition-[border-color,box-shadow] duration-200 block box-border focus:border-[#42b549] focus:outline-none"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              {/* eye-icon eye-open */}
              <svg
                onClick={() => setShowPassword(!showPassword)}
                className={`w-5 h-5 absolute right-3 top-[38px] cursor-pointer transition-opacity duration-200 ${
                  showPassword ? "hidden" : "block"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path
                  fill="#42b549"
                  d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
                />
              </svg>

              {/* eye-icon eye-closed */}
              <svg
                onClick={() => setShowPassword(!showPassword)}
                className={`w-5 h-5 absolute right-3 top-[38px] cursor-pointer transition-opacity duration-200 ${
                  showPassword ? "block" : "hidden"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path
                  fill="#42b549"
                  d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM204.5 138.7c23.5-16.8 52.4-26.7 83.5-26.7 79.5 0 144 64.5 144 144 0 31.1-9.9 59.9-26.7 83.5l-34.7-34.7c12.7-21.4 17-47.7 10.1-73.7-13.7-51.2-66.4-81.6-117.6-67.9-8.6 2.3-16.7 5.7-24 10l-34.7-34.7zM325.3 395.1c-11.9 3.2-24.4 4.9-37.3 4.9-79.5 0-144-64.5-144-144 0-12.9 1.7-25.4 4.9-37.3L69.4 139.2c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6l-64.2-64.2z"
                />
              </svg>
            </div>

            {/* auth-button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-[#42b549] border-none rounded-lg text-white text-base font-bold cursor-pointer transition-[background] duration-200 hover:bg-[#369043] disabled:cursor-not-allowed disabled:opacity-80"
            >
              <span style={{ display: loading ? "none" : "inline" }}>Masuk</span>
              <span
                style={
                  loading
                    ? {
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255, 255, 255, 0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginLeft: "8px",
                      }
                    : { display: "none" }
                }
              />
            </button>
          </form>

          {/* admin-login-divider */}
          <div className="flex items-center my-5 text-[#999] text-sm">
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <span className="px-3">atau</span>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>

          {/* admin-login-button (back to regular login) */}
          <a
            href="/login"
            className="flex items-center justify-center gap-2 w-full p-3 bg-[#1a1a2e] border-none rounded-lg text-white text-sm font-semibold cursor-pointer no-underline transition-[background] duration-200 hover:bg-[#16213e]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Kembali ke Login Pengguna
          </a>
        </div>
      </div>
    </>
  );
}

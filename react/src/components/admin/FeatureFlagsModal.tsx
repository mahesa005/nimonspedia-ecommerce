import { useState, useEffect } from "react";
import type { FeatureName, getFeatureFlagResponse } from "../../types/admin";
import { getFeatureFlag, updateFeatureFlag } from "../../api/adminApi";
import Toast from "../ui/toast";

interface Flag {
  name: FeatureName;
  label: string;
  status: getFeatureFlagResponse | null;
  loading: boolean;
  error: string | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface FeatureFlagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  userId?: number | null; // null for global flags
}

export default function FeatureFlagsModal({
  isOpen,
  onClose,
  token,
  userId = null,
}: FeatureFlagsModalProps) {
  const [flags, setFlags] = useState<Flag[]>([
    {
      name: "auction_enabled",
      label: "Auction Enabled",
      status: null,
      loading: true,
      error: null,
    },
    {
      name: "checkout_enabled",
      label: "Checkout Enabled",
      status: null,
      loading: true,
      error: null,
    },
    {
      name: "chat_enabled",
      label: "Chat Enabled",
      status: null,
      loading: true,
      error: null,
    },
  ]);

  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [globalFlags, setGlobalFlags] = useState<Record<FeatureName, getFeatureFlagResponse | null>>({
    auction_enabled: null,
    checkout_enabled: null,
    chat_enabled: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    flagName: FeatureName | null;
    newStatus: boolean;
  } | null>(null);
  const [disableReason, setDisableReason] = useState("");

  // Fetch all flags on modal open
  useEffect(() => {
    if (isOpen && token) {
      fetchAllFlags();
    }
  }, [isOpen, token, userId]);

  // Clear toasts when modal closes
  useEffect(() => {
    if (!isOpen) {
      setToasts([]);
    }
  }, [isOpen]);

  const fetchAllFlags = async () => {
    setFlags((prev) =>
      prev.map((f) => ({ ...f, loading: true, error: null }))
    );

    // If viewing user scope, also fetch global flags for guard logic
    if (userId !== null && userId !== undefined) {
      for (const flag of flags) {
        try {
          const globalStatus = await getFeatureFlag(null, flag.name, token!);
          setGlobalFlags((prev) => ({ ...prev, [flag.name]: globalStatus }));
        } catch (err) {
          // Silently fail for global flag fetch, continue with user flags
        }
      }
    }

    for (const flag of flags) {
      try {
        const status = await getFeatureFlag(userId ?? null, flag.name, token!);
        setFlags((prev) =>
          prev.map((f) =>
            f.name === flag.name ? { ...f, status, loading: false } : f
          )
        );
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch flag";
        setFlags((prev) =>
          prev.map((f) =>
            f.name === flag.name
              ? { ...f, error: errorMsg, loading: false }
              : f
          )
        );
      }
    }
  };

  const handleFlagToggle = (flagName: FeatureName, newStatus: boolean) => {
    // Check if user is trying to enable a globally disabled flag
    if (userId !== null && userId !== undefined && newStatus) {
      const globalFlagStatus = globalFlags[flagName];
      if (globalFlagStatus && !globalFlagStatus.enabled) {
        addToast(
          `Tidak dapat mengaktifkan flag ini karena disabled secara global`,
          'error'
        );
        return;
      }
    }

    setConfirmDialog({ flagName, newStatus });
    setDisableReason("");
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [{ message, type, id }, ...prev]);
  };

  // const removeToast = (id: string) => {
  //   setToasts((prev) => prev.filter((t) => t.id !== id));
  // };

  const confirmFlagUpdate = async () => {
    if (!confirmDialog || !token) return;

    const { flagName, newStatus } = confirmDialog;
    if (!flagName) return; // Guard against null flagName
    
    const reason = newStatus ? "" : disableReason;

    const flagIndex = flags.findIndex((f) => f.name === flagName);
    if (flagIndex === -1) return;

    setUpdating(true);
    const originalFlag = flags[flagIndex];

    try {
      // Optimistic update
      setFlags((prev) =>
        prev.map((f) =>
          f.name === flagName
            ? {
                ...f,
                status: f.status ? { ...f.status, enabled: newStatus } : null,
                loading: true,
              }
            : f
        )
      );

      // Call API
      await updateFeatureFlag(
        userId ?? null,
        flagName,
        newStatus,
        token,
        reason
      );

      // Verify by fetching again
      const updated = await getFeatureFlag(userId ?? null, flagName, token);
      setFlags((prev) =>
        prev.map((f) =>
          f.name === flagName
            ? { ...f, status: updated, loading: false, error: null }
            : f
        )
      );

      // Show success toast
      addToast(
        `Flag berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
        'success'
      );

      // Close dialog
      setConfirmDialog(null);
      setDisableReason("");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update flag";

      // Revert to original
      setFlags((prev) =>
        prev.map((f) =>
          f.name === flagName
            ? { ...f, status: originalFlag.status, error: errorMsg, loading: false }
            : f
        )
      );

      // Show error toast
      addToast(`Gagal mengubah flag: ${errorMsg}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  const scopeLabel =
    userId === null ? "Global Flags" : `User #${userId} Flags`;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Kelola Feature Flags
              </h2>
              <p className="text-sm text-gray-600 mt-1">{scopeLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{flag.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {flag.name}
                  </p>
                  {flag.status && (
                    <p className="text-xs text-gray-600 mt-1">
                      Scope:{" "}
                      <span className="font-semibold capitalize">
                        {flag.status.scope}
                      </span>
                      {flag.status.reason && (
                        <span className="block text-gray-500">
                          Reason: {flag.status.reason}
                        </span>
                      )}
                    </p>
                  )}
                  {flag.error && (
                    <p className="text-xs text-red-600 mt-1">{flag.error}</p>
                  )}
                </div>

                {/* Status Display */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-center min-w-24">
                    {flag.loading ? (
                      <span className="text-sm text-gray-500 font-semibold">Loading...</span>
                    ) : (
                      <span
                        className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                          flag.status?.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {flag.status?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      // Open dropdown/menu for changing status
                      if (flag.status?.enabled) {
                        handleFlagToggle(flag.name, false);
                      } else {
                        handleFlagToggle(flag.name, true);
                      }
                    }}
                    disabled={flag.loading || updating}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold text-sm cursor-pointer rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-900 font-semibold text-sm cursor-pointer rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
            onClick={() => {
              setConfirmDialog(null);
              setDisableReason("");
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {confirmDialog.newStatus ? "Aktifkan Flag" : "Nonaktifkan Flag"}
                </h3>

                {!confirmDialog.newStatus && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan Menonaktifkan:
                    </label>
                    <textarea
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                      placeholder="Masukkan alasan menonaktifkan flag ini..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#42b549] focus:ring-1 focus:ring-[#42b549] resize-none"
                      rows={4}
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-6">
                  {confirmDialog.newStatus
                    ? "Apakah Anda yakin ingin mengaktifkan flag ini?"
                    : "Apakah Anda yakin ingin menonaktifkan flag ini?"}
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setConfirmDialog(null);
                      setDisableReason("");
                    }}
                    disabled={updating}
                    className="px-4 py-2.5 bg-gray-200 text-gray-900 font-semibold cursor-pointer text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmFlagUpdate}
                    disabled={updating || (!confirmDialog.newStatus && !disableReason.trim())}
                    className={`px-4 py-2.5 font-semibold text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmDialog.newStatus
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {updating ? "Memproses..." : "Konfirmasi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center gap-3">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
              animation: `slideDown 0.3s ease-out forwards`
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

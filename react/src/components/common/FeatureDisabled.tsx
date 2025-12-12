interface Props {
  featureName?: string;
  reason?: string | null;
}

export default function FeatureDisabled({ featureName = 'Fitur', reason }: Props) {
  const isMaintenance = reason?.toLowerCase().includes('maintenance') || !reason;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
        <div className="text-7xl mb-6 animate-pulse">
          {isMaintenance ? '🛠️' : '🔒'}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {isMaintenance ? 'Sedang Dalam Perbaikan' : 'Akses Dibatasi'}
        </h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left rounded-r">
          <p className="text-sm font-bold text-yellow-700 uppercase mb-1">
            Status: {featureName}
          </p>
          <p className="text-gray-700 italic">
            "{reason || 'Fitur ini sedang dinonaktifkan sementara waktu untuk peningkatan sistem.'}"
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <a 
            href="/" 
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali ke Home
          </a>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#42b549] text-white font-semibold rounded-lg hover:bg-[#369b3f] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
import type { AuctionDetailData } from '../../types/auction';

export default function AuctionInfo({ data }: { data: AuctionDetailData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="lg:flex lg:gap-8">
        {/* Image */}
        <div className="w-full lg:w-1/2 aspect-square bg-[#f0f0f0] rounded-lg border border-[#e0e0e0] overflow-hidden flex items-center justify-center">
          <img 
            src={data.main_image_path || '/placeholder.png'} 
            alt={data.product_name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Name, Metadata, Store */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start">
          <h1 className="text-[1.8rem] font-bold text-[#333] leading-tight mb-2">
            {data.product_name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-[#666] mb-4">
            <span className="bg-[#f1f1f1] px-2 py-0.5 rounded text-[#42b549] font-bold uppercase tracking-wide">
              {data.status}
            </span>
            <span>•</span>
            <span>Quantity: {data.quantity}</span>
          </div>

          <a
            className="bg-[#f8f9fa] p-4 rounded-lg flex items-center gap-4 border border-[#eee] transition-colors hover:bg-[#f1f1f1] cursor-pointer mb-4"
            href={`/store/${data.store_id}`}
            >
            <div className="w-10 h-10 rounded-full bg-[#e9ecef] flex items-center justify-center overflow-hidden shrink-0">
              {data.main_image_path ? (
              <img
                src={data.main_image_path}
                alt={data.store_name}
                className="w-full h-full object-cover"
              />
              ) : (
              <svg
                className="w-5 h-5 text-[#666]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-[#333] text-[1.1rem]">{data.store_name}</p>
              <p className="text-xs text-[#666]">Official Store</p>
            </div>
          </a>

          <div className="bg-white p-4 rounded-lg border border-[#e0e0e0] shadow-sm">
            <h3 className="text-sm text-[#666] uppercase font-bold mb-3 tracking-wide">Auction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-[#333]">
              
              <div>
                <div className="text-[#666]">Starting Price</div>
                <div className="font-bold">
                  Rp {data.starting_price.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-[#666]">Minimum Increment</div>
                <div className="font-bold">
                  Rp {data.min_increment.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-[#666]">Start Time</div>
                <div className="font-bold text-[#007bff]">
                  {new Date(data.start_time).toLocaleDateString()}
                  <br/>
                  {new Date(data.start_time).toLocaleTimeString()}
                </div>
              </div>

              <div>
                <div className="text-[#666]">End Time</div>
                <div className="font-bold text-[#dc3545]">
                  {data.end_time ? new Date(data.end_time).toLocaleDateString() : '—'}
                  <br/>
                  {data.end_time ? new Date(data.end_time).toLocaleTimeString() : ''}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="border-t border-[#e0e0e0] pt-4">
        <h3 className="text-[1.3rem] font-bold text-[#333] mb-4">Description</h3>
        <div 
          className="text-[#666] leading-[1.7] text-[0.95rem] prose max-w-none"
          dangerouslySetInnerHTML={{ __html: data.description }} 
        />
      </div>
    </div>
  );
}

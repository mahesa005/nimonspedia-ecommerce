import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FeatureDisabled from '../components/common/FeatureDisabled';
import BuyerNavbar from '../components/ui/BuyerNavbar';
import SellerNavbar from '../components/ui/SellerNavbar';
import { useNavbarData } from '../hooks/useNavbarData';

export default function FeatureDisabledPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, store, cartCount, flags, handleLogout } = useNavbarData();
  
  const featureParam = searchParams.get('feature');
  
  const [verifiedReason, setVerifiedReason] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!featureParam) {
        navigate('/', { replace: true });
        return;
    }

    const verifyStatus = async () => {
      try {
        const res = await fetch('/api/node/features/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureName: featureParam }),
          credentials: 'include'
        });
        
        const json = await res.json();

        if (json.success && json.data.enabled === true) {
            navigate('/', { replace: true });
        } else {
            setVerifiedReason(json.data.reason);
            setIsValidating(false);
        }
      } catch (e) {
        console.log(e);
        setIsValidating(false);
      }
    };

    verifyStatus();
  }, [featureParam, navigate]);

  if (isValidating) {
      return null;
  }

  const formattedName = (featureParam || '')
    .replace('_enabled', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const isSeller = user?.role === 'SELLER';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#333]">
      {user && (
        isSeller ? (
          <SellerNavbar storeBalance={store?.balance || 0} onLogout={handleLogout} flags={flags} />
        ) : (
          <BuyerNavbar 
            userBalance={user.balance} 
            cartItemCount={cartCount} 
            onLogout={handleLogout} 
            onBalanceUpdate={() => {}}
            flags={flags}
          />
        )
      )}

      <FeatureDisabled featureName={formattedName} reason={verifiedReason} />
    </div>
  );
}
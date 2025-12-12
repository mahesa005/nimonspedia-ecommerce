import React, { useEffect, useState } from 'react';
import FeatureDisabled from './FeatureDisabled';

type FeatureName = "checkout_enabled" | "chat_enabled" | "auction_enabled";

interface FeatureGuardProps {
  flag: FeatureName;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

export default function FeatureMiddleware({ flag, children, skeleton }: FeatureGuardProps) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkFlag = async () => {
      try {
        const res = await fetch('/api/node/features/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureName: flag }),
          credentials: 'include'
        });
        
        const json = await res.json();
        
        if (isMounted) {
          if (json.success) {
            setIsEnabled(json.data.enabled);
            setReason(json.data.reason);
          } else {
            setIsEnabled(true);
          }
        }
      } catch (error) {
        console.error("Feature Guard Error:", error);
        if (isMounted) setIsEnabled(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkFlag();

    return () => { isMounted = false; };
  }, [flag]);

  if (loading) {
    return <>{skeleton || null}</>;
  }

  if (isEnabled === false) {
    return <FeatureDisabled featureName={flag.replace('_enabled', '')} reason={reason} />;
  }

  return <>{children}</>;
}
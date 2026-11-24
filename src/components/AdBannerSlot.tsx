import React, { useEffect, useRef } from 'react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
}

/**
 * Google AdSense container kept strictly on informational website pages,
 * completely separated from the 3D gameplay viewport and interactive buttons.
 *
 * When VITE_ADSENSE_CLIENT is not configured yet, renders nothing (no fake ads
 * or fabricated publisher IDs). Once AdSense is approved and configured in
 * environment variables, it initializes the official adsbygoogle unit.
 */
export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId,
  format = 'auto',
}) => {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!client || !slotId || pushedRef.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // Ignore if AdSense script is blocked or not yet loaded
    }
  }, [client, slotId]);

  if (!client || !slotId) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className="my-10 py-4 border-y border-white/10 flex flex-col items-center justify-center"
    >
      <span className="text-[11px] text-[#8c8378] mb-2">Advertisement</span>
      <ins
        className="adsbygoogle block w-full max-w-[728px] min-h-[90px]"
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
};

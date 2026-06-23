"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface GoogleAdSenseBannerProps {
  clientId?: string;
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: "true" | "false";
  style?: React.CSSProperties;
  className?: string;
  showPlaceholderInDev?: boolean;
}

export function GoogleAdSenseBanner({
  clientId,
  slot,
  format = "auto",
  responsive = "true",
  style = { display: "block" },
  className = "",
  showPlaceholderInDev = true,
}: GoogleAdSenseBannerProps) {
  const pathname = usePathname();
  const activeClientId = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!activeClientId) return;
    if (isDev && showPlaceholderInDev) return;

    try {
      // Safely initialize the global adsbygoogle array and push
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.warn("Google AdSense execution failed or was blocked:", error);
    }
  }, [pathname, activeClientId, slot]);

  if (!activeClientId) {
    if (showPlaceholderInDev) {
      return (
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-amber-500/50 bg-amber-500/5 rounded-lg text-center text-xs text-amber-500/80 my-4">
          <p className="font-semibold mb-1">⚠️ AdSense Client ID Missing</p>
          <p>
            Please set the <code>NEXT_PUBLIC_ADSENSE_CLIENT_ID</code> environment variable.
          </p>
        </div>
      );
    }
    return null;
  }

  // Visual placeholder for development and layout verification
  if (isDev && showPlaceholderInDev) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 bg-muted/40 rounded-xl text-center text-sm font-medium text-muted-foreground my-4 ${className}`}
        style={style}
      >
        <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full mb-2 font-semibold">
          Google AdSense Slot
        </span>
        <span className="font-semibold text-foreground">Slot ID: {slot}</span>
        <span className="text-xs text-muted-foreground mt-1">Client ID: {activeClientId}</span>
        <span className="text-xs text-muted-foreground">
          Format: {format} | Responsive: {responsive}
        </span>
      </div>
    );
  }

  return (
    <div className={`adsense-banner-container overflow-hidden my-4 ${className}`} style={{ minHeight: "100px" }}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={activeClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

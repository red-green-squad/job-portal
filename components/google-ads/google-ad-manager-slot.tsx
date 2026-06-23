"use client";

import { useEffect, useRef, useId } from "react";
import { usePathname } from "next/navigation";

interface GoogleAdManagerSlotProps {
  adUnitPath: string; // E.g., "/1234567/sports_sidebar"
  sizes: [number, number] | [number, number][] | "fluid";
  id?: string; // Optional element ID, otherwise dynamically generated
  className?: string;
  style?: React.CSSProperties;
  showPlaceholderInDev?: boolean;
}

export function GoogleAdManagerSlot({
  adUnitPath,
  sizes,
  id,
  className = "",
  style,
  showPlaceholderInDev = true,
}: GoogleAdManagerSlotProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // React 19 compliant stable unique ID generation
  const generatedId = useId();
  const uniqueId = id || `div-gpt-ad-${generatedId.replace(/:/g, "")}`;

  const isDev = process.env.NODE_ENV === "development";
  const sizesString = JSON.stringify(sizes);

  useEffect(() => {
    if (isDev && showPlaceholderInDev) return;

    const googletag = (window as any).googletag;
    if (!googletag || !googletag.cmd) return;

    let definedSlot: any = null;

    googletag.cmd.push(() => {
      // Parse sizes back from the dependency string to keep the effect dependency array clean
      const parsedSizes = JSON.parse(sizesString);
      
      // Define slot targeting the specific element ID
      definedSlot = googletag.defineSlot(adUnitPath, parsedSizes, uniqueId);
      if (definedSlot) {
        definedSlot.addService(googletag.pubads());
        
        // Display the ad unit
        googletag.display(uniqueId);
      }
    });

    // Cleanup slot registration on component unmount or navigation change
    return () => {
      if (definedSlot && googletag.cmd) {
        googletag.cmd.push(() => {
          googletag.destroySlots([definedSlot]);
        });
      }
    };
  }, [pathname, adUnitPath, uniqueId, sizesString]);

  if (isDev && showPlaceholderInDev) {
    const formattedSizes = Array.isArray(sizes)
      ? Array.isArray(sizes[0])
        ? (sizes as [number, number][]).map(([w, h]) => `${w}x${h}`).join(", ")
        : `${sizes[0]}x${sizes[1]}`
      : String(sizes);

    return (
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 rounded-xl text-center text-sm font-medium text-muted-foreground my-4 ${className}`}
        style={style || { minHeight: "100px" }}
      >
        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full mb-2 font-semibold">
          Google Ad Manager
        </span>
        <span className="font-semibold text-foreground">Unit: {adUnitPath}</span>
        <span className="text-xs text-muted-foreground mt-1 font-mono">ID: {uniqueId}</span>
        <span className="text-xs text-muted-foreground">Sizes: {formattedSizes}</span>
      </div>
    );
  }

  return (
    <div
      id={uniqueId}
      ref={containerRef}
      className={`ad-manager-slot my-4 ${className}`}
      style={style}
    />
  );
}

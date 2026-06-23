import Script from "next/script";

interface GoogleAdSenseScriptProps {
  clientId?: string;
}

export function GoogleAdSenseScript({ clientId }: GoogleAdSenseScriptProps) {
  const activeClientId = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!activeClientId) {
    return null;
  }

  // Ensure client ID starts with ca-pub- prefix
  const formattedClientId = activeClientId.startsWith("ca-pub-")
    ? activeClientId
    : `ca-pub-${activeClientId}`;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

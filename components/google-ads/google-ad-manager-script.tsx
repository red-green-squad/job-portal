import Script from "next/script";

export function GoogleAdManagerScript() {
  return (
    <>
      <Script
        async
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="afterInteractive"
      />
      <Script id="gpt-init-script" strategy="afterInteractive">
        {`
          window.googletag = window.googletag || { cmd: [] };
          googletag.cmd.push(function() {
            // Enable SRA (Single Request Architecture) for optimized ad loading
            googletag.pubads().enableSingleRequest();
            // Enable publisher services
            googletag.enableServices();
          });
        `}
      </Script>
    </>
  );
}

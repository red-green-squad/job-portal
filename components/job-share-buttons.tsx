"use client";

import { useEffect, useState } from "react";

interface JobShareButtonsProps {
  title: string;
  company: string;
}

const platforms = (url: string, text: string) => [
  {
    name: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    bg: "bg-[#1877F2]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M4 4 20 20M20 4 4 20" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
    bg: "bg-[#E60023]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.96 0-4.7 2.22-4.7 4.51 0 .89.34 1.85.77 2.37.08.1.09.2.07.3-.08.32-.25 1.04-.28 1.18-.04.19-.14.23-.32.14-1.24-.58-2.02-2.4-2.02-3.86 0-3.14 2.28-6.02 6.57-6.02 3.45 0 6.13 2.46 6.13 5.74 0 3.43-2.16 6.18-5.15 6.18-1.01 0-1.95-.52-2.27-1.14l-.62 2.31c-.22.86-.82 1.94-1.23 2.6.93.29 1.91.44 2.93.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    bg: "bg-[#0A66C2]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    bg: "bg-[#26A5E4]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-15.5 6.233a2.105 2.105 0 0 0 .29 4.008l3.908 1.26 2.032 6.14a.44.44 0 0 0 .807.085l2.468-3.467 4.153 3.065a2.1 2.1 0 0 0 3.26-1.298l2.405-14.55a2.1 2.1 0 0 0-2.801-2.691zM9.5 13.5l-2.8-.9 10.8-6.5-8 7.4zm1.5 5-.9-3.3 1.8-1.7 2.4 1.8-3.3 3.2zm5.2.8-4.5-3.3 8.3-8.9-3.8 12.2z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
    bg: "bg-[#25D366]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export function JobShareButtons({ title, company }: JobShareButtonsProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const text = `${title} at ${company}`;
  const buttons = platforms(url, text);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Share this job</p>
      <div className="flex flex-wrap gap-3">
        {buttons.map((p) => (
          <a
            key={p.name}
            href={p.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${p.name}`}
            className={`${p.bg} text-white rounded-lg p-3 flex items-center justify-center transition-opacity hover:opacity-85`}
          >
            {p.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

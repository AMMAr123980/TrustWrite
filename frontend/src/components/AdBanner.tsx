"use client";

interface AdBannerProps {
  slotId?: string;
  format?: "horizontal" | "rectangle";
  className?: string;
}

export function AdBanner({ slotId = "sample-slot", format = "horizontal", className = "" }: AdBannerProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center my-6 ${className}`}
    >
      <div className="flex flex-col items-center justify-center min-h-[90px]">
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Sponsored Resource / Educational Partner
        </span>
        <div className="mt-2 text-xs text-slate-500">
          AdSense policy-compliant content container ({format})
        </div>
      </div>
    </div>
  );
}

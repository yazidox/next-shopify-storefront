"use client";

import dynamic from "next/dynamic";

const CustomStrapStudio = dynamic(
  () => import("./custom-strap-studio").then((m) => m.CustomStrapStudio),
  {
    ssr: false,
    loading: () => <CustomStrapStudioFallback />,
  },
);

export function CustomStrapLoader({ customStrapVariantId }: { customStrapVariantId: string | null }) {
  return <CustomStrapStudio customStrapVariantId={customStrapVariantId} />;
}

function CustomStrapStudioFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream pt-24">
      <div className="flex flex-col items-center gap-5">
        <span className="h-12 w-12 animate-spin rounded-full border-2 border-ink/15 border-t-ink" aria-hidden />
        <span className="text-[10px] font-bold tracking-[0.32em] text-muted uppercase">Loading studio…</span>
      </div>
    </div>
  );
}

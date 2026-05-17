import { ReactNode } from "react";

export function StoreContentShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-6 pt-32 pb-28 lg:px-12 lg:pt-40">
      <header className="mb-12 border-b border-line pb-10">
        <div className="mb-5 flex items-center gap-3 text-muted">
          <span className="font-display text-[11px] tracking-[0.32em] uppercase">{eyebrow}</span>
          <span className="h-px w-10 bg-line sm:w-12" />
        </div>
        <h1 className="font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl md:text-5xl">{title}</h1>
      </header>
      <div className="space-y-6 text-base leading-relaxed text-ink/75 [&_a]:transition-colors [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:uppercase [&_h2]:text-ink [&_h2]:first:mt-0 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

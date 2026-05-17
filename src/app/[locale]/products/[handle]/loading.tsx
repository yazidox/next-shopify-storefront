export default function Loading() {
  return (
    <div className="pt-24 pb-20 lg:pt-28">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_520px]">
        <div className="bg-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 lg:p-4">
            <div className="order-2 flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 lg:order-1 lg:flex-col lg:gap-2 lg:px-0 lg:pb-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-md bg-line/40" />
              ))}
            </div>
            <div className="order-1 aspect-3/2 flex-1 animate-pulse bg-line/30 lg:order-2" />
          </div>
        </div>

        <aside className="px-6 pt-10 pb-12 lg:px-10 lg:pt-12 lg:pb-16">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-24 animate-pulse rounded-md bg-line/60" />
              <div className="h-6 w-20 animate-pulse rounded-sm bg-line/50" />
            </div>
            <div className="h-12 w-3/4 animate-pulse rounded-md bg-line/60 lg:h-14" />
            <div className="h-5 w-32 animate-pulse rounded bg-line/40" />
            <div className="h-10 w-40 animate-pulse rounded-md bg-line/50" />
            <div className="h-px w-full bg-line" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 w-11 animate-pulse rounded-full bg-line/50" />
              ))}
            </div>
            <div className="h-12 w-full animate-pulse rounded-md bg-line/40" />
            <div className="h-14 w-full animate-pulse rounded-md bg-ink/80" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-11 animate-pulse rounded-md bg-line/40" />
              <div className="h-11 animate-pulse rounded-md bg-line/40" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

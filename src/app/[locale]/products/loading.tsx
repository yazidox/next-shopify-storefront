export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 flex flex-col gap-6 lg:mb-20">
          <div className="flex items-center gap-3">
            <span className="h-3 w-6 animate-pulse rounded bg-line/60" />
            <span className="h-px w-12 bg-line" />
            <span className="h-3 w-28 animate-pulse rounded bg-line/60" />
          </div>
          <div className="h-12 w-3/4 animate-pulse rounded-md bg-line/60 lg:h-20 lg:w-1/2" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-3/4 animate-pulse rounded-3xl bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

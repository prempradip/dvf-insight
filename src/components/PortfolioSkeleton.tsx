const ShimmerBlock = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-md bg-muted/60 shimmer ${className}`} />
);

const SkeletonCard = () => (
  <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
      <div className="flex items-center gap-3">
        <ShimmerBlock className="w-7 h-7 rounded-full" />
        <div className="space-y-1.5">
          <ShimmerBlock className="h-3.5 w-32" />
          <ShimmerBlock className="h-2.5 w-20" />
        </div>
      </div>
      <ShimmerBlock className="h-6 w-12 rounded-full" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-card px-3 py-2.5 flex flex-col items-center gap-1">
          <ShimmerBlock className="h-2 w-12" />
          <ShimmerBlock className="h-3.5 w-8" />
        </div>
      ))}
    </div>
    <div className="px-4 py-2.5">
      <ShimmerBlock className="h-2 w-full rounded-full" />
    </div>
  </div>
);

const SkeletonChart = ({ tall = false }: { tall?: boolean }) => (
  <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
    <ShimmerBlock className="h-3.5 w-36 mb-3" />
    <ShimmerBlock className={`w-full rounded-lg ${tall ? "h-[280px]" : "h-[200px]"}`} />
  </div>
);

const PortfolioSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    <SkeletonChart tall />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonChart />
      <SkeletonChart />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default PortfolioSkeleton;

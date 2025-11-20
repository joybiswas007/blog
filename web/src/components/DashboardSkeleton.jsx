const DashboardSkeleton = ({ count = 8 }) => {
    return (
        <div className="space-y-0 border border-[var(--color-panel-border)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 border-b border-b-[var(--color-editor-bg)] last:border-b-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className="flex-1 flex items-baseline gap-4 min-w-0">
                        {/* Title skeleton */}
                        <div className="flex-1 h-5 rounded animate-shimmer bg-[var(--color-hover-bg)]" />
                        {/* Date skeleton */}
                        <div className="w-24 h-4 rounded animate-shimmer bg-[var(--color-hover-bg)]" />
                    </div>
                    {/* Action buttons skeleton */}
                    <div className="flex items-center gap-1 ml-4">
                        <div className="w-8 h-8 rounded animate-shimmer bg-[var(--color-hover-bg)]" />
                        <div className="w-8 h-8 rounded animate-shimmer bg-[var(--color-hover-bg)]" />
                        <div className="w-8 h-8 rounded animate-shimmer bg-[var(--color-hover-bg)]" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardSkeleton;

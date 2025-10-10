const EditorSkeleton = () => (
  <div className="border border-blue-800 rounded bg-blue-900/10 p-4 h-[400px] animate-pulse">
    {/* Toolbar skeleton */}
    <div className="flex gap-2 mb-4 pb-3 border-b border-blue-800/50">
      <div className="h-8 w-8 bg-blue-900/30 rounded"></div>
      <div className="h-8 w-8 bg-blue-900/30 rounded"></div>
      <div className="h-8 w-8 bg-blue-900/30 rounded"></div>
      <div className="h-8 w-px bg-blue-800/50 mx-1"></div>
      <div className="h-8 w-8 bg-blue-900/30 rounded"></div>
      <div className="h-8 w-8 bg-blue-900/30 rounded"></div>
    </div>

    {/* Content skeleton */}
    <div className="space-y-3">
      <div className="h-4 bg-blue-900/30 rounded w-3/4"></div>
      <div className="h-4 bg-blue-900/30 rounded w-full"></div>
      <div className="h-4 bg-blue-900/30 rounded w-5/6"></div>
      <div className="h-4 bg-blue-900/30 rounded w-2/3 mt-6"></div>
      <div className="h-4 bg-blue-900/30 rounded w-full"></div>
      <div className="h-4 bg-blue-900/30 rounded w-4/5"></div>
    </div>
  </div>
);

export default EditorSkeleton;

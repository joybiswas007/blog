const EditorSkeleton = () => (
  <div className="border border-[#3e4451] rounded bg-[#1e2127] p-4 h-[400px] animate-pulse">
    {/* Toolbar skeleton */}
    <div className="flex gap-2 mb-4 pb-3 border-b border-[#2c313a]">
      <div className="h-8 w-8 bg-[#2c313a] rounded"></div>
      <div className="h-8 w-8 bg-[#2c313a] rounded"></div>
      <div className="h-8 w-8 bg-[#2c313a] rounded"></div>
      <div className="h-8 w-px bg-[#3e4451] mx-1"></div>
      <div className="h-8 w-8 bg-[#2c313a] rounded"></div>
      <div className="h-8 w-8 bg-[#2c313a] rounded"></div>
    </div>

    {/* Content skeleton */}
    <div className="space-y-3">
      <div className="h-4 bg-[#2c313a] rounded w-3/4"></div>
      <div className="h-4 bg-[#2c313a] rounded w-full"></div>
      <div className="h-4 bg-[#2c313a] rounded w-5/6"></div>
      <div className="h-4 bg-[#2c313a] rounded w-2/3 mt-6"></div>
      <div className="h-4 bg-[#2c313a] rounded w-full"></div>
      <div className="h-4 bg-[#2c313a] rounded w-4/5"></div>
    </div>
  </div>
);

export default EditorSkeleton;

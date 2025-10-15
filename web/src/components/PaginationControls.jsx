import { Link } from "react-router-dom";

const PaginationControls = ({
  totalPost,
  limit,
  offset,
  currentPage,
  totalPages,
  buildQueryString,
  orderBy,
  sort,
  tag
}) => {
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < totalPost;

  return totalPost > limit ? (
    <div className="flex justify-center items-center gap-0 mt-8 py-4">
      {/* Previous Button */}
      <Link
        to={buildQueryString({
          limit,
          offset: Math.max(0, offset - limit),
          order_by: orderBy,
          sort,
          tag
        })}
        className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] no-underline font-mono bg-[#2c313a] rounded-l transition-all duration-150 ${
          !hasPrevious
            ? "opacity-30 cursor-not-allowed pointer-events-none text-[#5c6370]"
            : "text-[#abb2bf] hover:bg-[#353b45] hover:text-[#61afef]"
        }`}
        aria-label="Previous page"
        aria-disabled={!hasPrevious}
        tabIndex={hasPrevious ? 0 : -1}
      >
        <span className="text-[#61afef] font-semibold text-base">‹</span>
        <span>Previous</span>
      </Link>

      {/* Page Counter */}
      <div className="inline-flex items-center px-5 py-2 text-[13px] font-mono bg-[#353b45] text-[#abb2bf]">
        <span className="text-[#5c6370]">Page</span>
        <span className="mx-2 text-[#61afef] font-semibold">{currentPage}</span>
        <span className="text-[#5c6370]">of</span>
        <span className="ml-2 text-[#5c6370]">{totalPages}</span>
      </div>

      {/* Next Button */}
      <Link
        to={buildQueryString({
          limit,
          offset: offset + limit,
          order_by: orderBy,
          sort,
          tag
        })}
        className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] no-underline font-mono bg-[#2c313a] rounded-r transition-all duration-150 ${
          !hasNext
            ? "opacity-30 cursor-not-allowed pointer-events-none text-[#5c6370]"
            : "text-[#abb2bf] hover:bg-[#353b45] hover:text-[#61afef]"
        }`}
        aria-label="Next page"
        aria-disabled={!hasNext}
        tabIndex={hasNext ? 0 : -1}
      >
        <span>Next</span>
        <span className="text-[#61afef] font-semibold text-base">›</span>
      </Link>
    </div>
  ) : null;
};

export default PaginationControls;

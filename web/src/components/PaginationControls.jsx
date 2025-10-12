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
  tag,
}) =>
  totalPost > limit && (
    <div className="flex justify-center items-center space-x-6 mt-12 pt-8">
      <Link
        to={buildQueryString({
          limit,
          offset: Math.max(0, offset - limit),
          order_by: orderBy,
          sort,
          tag,
        })}
        className={`font-mono transition-colors flex items-center ${
          offset > 0
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Previous page"
        tabIndex={offset > 0 ? 0 : -1}
      >
        <span className="text-blue-500 mr-1">&lt;</span>
        Previous
      </Link>

      <p className="text-[var(--color-text-secondary)] text-sm font-mono">
        Page {currentPage} of {totalPages}
      </p>

      <Link
        to={buildQueryString({
          limit,
          offset: offset + limit,
          order_by: orderBy,
          sort,
          tag,
        })}
        className={`font-mono transition-colors flex items-center ${
          offset + limit < totalPost
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Next page"
        tabIndex={offset + limit < totalPost ? 0 : -1}
      >
        Next
        <span className="text-blue-500 ml-1">&gt;</span>
      </Link>
    </div>
  );

export default PaginationControls;

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
    <div className="pagination">
      <Link
        to={buildQueryString({
          limit,
          offset: Math.max(0, offset - limit),
          order_by: orderBy,
          sort,
          tag
        })}
        className={`pagination-button ${!hasPrevious ? "disabled" : ""}`}
        aria-label="Previous page"
        aria-disabled={!hasPrevious}
        tabIndex={hasPrevious ? 0 : -1}
      >
        <span className="pagination-arrow">‹</span>
        <span>Previous</span>
      </Link>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <Link
        to={buildQueryString({
          limit,
          offset: offset + limit,
          order_by: orderBy,
          sort,
          tag
        })}
        className={`pagination-button ${!hasNext ? "disabled" : ""}`}
        aria-label="Next page"
        aria-disabled={!hasNext}
        tabIndex={hasNext ? 0 : -1}
      >
        <span>Next</span>
        <span className="pagination-arrow">›</span>
      </Link>
    </div>
  ) : null;
};

export default PaginationControls;

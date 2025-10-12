import { Link } from "react-router-dom";

const SORT_OPTIONS = [
  { orderBy: "created_at", sort: "DESC", label: "Newest" },
  { orderBy: "created_at", sort: "ASC", label: "Oldest" },
  { orderBy: "title", sort: "ASC", label: "A-Z" },
];

const SortingControls = ({
  selectedSort,
  handleSortChange,
  tag,
  buildQueryString,
  limit,
  offset,
  orderBy,
  sort,
}) => (
  <div className="flex justify-between items-center px-4 py-3">
    <div className="flex items-center space-x-4">
      <p className="text-[var(--color-text-primary)] text-sm">Sort by:</p>
      <select
        value={selectedSort.label}
        onChange={handleSortChange}
        className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)] rounded px-2 py-1 font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Sort options"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    {tag && (
      <div className="flex items-center">
        <span className="text-[var(--color-text-secondary)] text-sm mr-2">
          Filter:
        </span>
        <span className="text-blue-400 font-mono text-sm">#{tag}</span>
        <Link
          to={buildQueryString({
            limit,
            offset: 0,
            order_by: orderBy,
            sort,
          })}
          className="ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm"
          aria-label="Clear filter"
        >
          &times;
        </Link>
      </div>
    )}
  </div>
);

export default SortingControls;

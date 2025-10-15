import { Link } from "react-router-dom";

const SORT_OPTIONS = [
  { orderBy: "created_at", sort: "DESC", label: "Newest" },
  { orderBy: "created_at", sort: "ASC", label: "Oldest" },
  { orderBy: "title", sort: "ASC", label: "A-Z" }
];

const SortingControls = ({
  selectedSort,
  handleSortChange,
  tag,
  buildQueryString,
  limit,
  orderBy,
  sort
}) => (
  <div className="toolbar">
    <div className="toolbar-section">
      <span className="toolbar-label">Sort By</span>
      <select
        value={selectedSort.label}
        onChange={handleSortChange}
        className="toolbar-select"
        aria-label="Sort options"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    {tag && (
      <div className="toolbar-section">
        <div className="filter-chip">
          <span className="filter-chip-label">Filtering:</span>
          <span className="filter-chip-value">#{tag}</span>
          <Link
            to={buildQueryString({
              limit,
              offset: 0,
              order_by: orderBy,
              sort
            })}
            className="filter-chip-close"
            aria-label="Clear tag filter"
          >
            ×
          </Link>
        </div>
      </div>
    )}
  </div>
);

export default SortingControls;

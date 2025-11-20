import { Link } from "react-router-dom";
import { BsFilter, BsX } from "react-icons/bs";

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
  <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-sidebar-bg)]">
    {/* Sort Section */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-hover-bg)] rounded">
        <BsFilter className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
        <span className="text-[11px] font-semibold font-sans text-[var(--color-text-secondary)] uppercase tracking-wider">
          Sort
        </span>
      </div>

      <div className="relative">
        <select
          value={selectedSort.label}
          onChange={handleSortChange}
          className="appearance-none pl-3 pr-8 py-1.5 rounded text-[13px] font-mono bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] transition-all duration-150 cursor-pointer hover:bg-[var(--color-active-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
          aria-label="Sort options"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>

    {/* Tag Filter */}
    {tag && (
      <div className="flex items-center">
        <div className="inline-flex items-center gap-0 rounded overflow-hidden">
          {/* Tag label section */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-active-bg)]">
            <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
              Filter:
            </span>
            <span className="text-[13px] text-[var(--color-accent-primary)] font-medium font-mono">
              #{tag}
            </span>
          </div>

          {/* Clear button */}
          <Link
            to={buildQueryString({
              limit,
              offset: 0,
              order_by: orderBy,
              sort
            })}
            className="flex items-center justify-center w-8 h-full bg-[var(--color-hover-bg)] no-underline text-[var(--color-text-secondary)] transition-all duration-150 hover:bg-[var(--color-syntax-variable)] hover:text-white"
            aria-label="Clear tag filter"
            title="Clear filter"
          >
            <BsX className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )}
  </div>
);

export default SortingControls;

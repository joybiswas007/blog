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
  <div className="flex justify-between items-center px-4 py-2 bg-[#21252b] border-b border-[#181a1f]">
    {/* Sort Section */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2c313a] border border-[#181a1f] rounded">
        <BsFilter className="w-3.5 h-3.5 text-[#61afef]" />
        <span className="text-[11px] font-semibold font-sans text-[#5c6370] uppercase tracking-wider">
          Sort
        </span>
      </div>

      <div className="relative">
        <select
          value={selectedSort.label}
          onChange={handleSortChange}
          className="appearance-none pl-3 pr-8 py-1.5 rounded text-[13px] font-mono bg-[#2c313a] text-[#abb2bf] border border-[#181a1f] transition-all duration-150 cursor-pointer hover:border-[#61afef] hover:bg-[#353b45] focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef]"
          aria-label="Sort options"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5c6370]">
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
        <div className="inline-flex items-center gap-0 rounded overflow-hidden border border-[#181a1f]">
          {/* Tag label section */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#353b45] border-r border-[#181a1f]">
            <span className="text-[11px] font-mono text-[#5c6370]">
              Filter:
            </span>
            <span className="text-[13px] text-[#61afef] font-medium font-mono">
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
            className="flex items-center justify-center w-8 h-full bg-[#2c313a] no-underline text-[#5c6370] transition-all duration-150 hover:bg-[#e06c75] hover:text-white"
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

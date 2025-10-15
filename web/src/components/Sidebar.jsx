import { Link, useLocation } from "react-router-dom";
import {
  BsFolder2Open,
  BsFileText,
  BsTag,
  BsChevronRight
} from "react-icons/bs";

const NAV_ITEMS = [
  { label: "Posts", to: "/", icon: <BsFileText /> },
  { label: "Archives", to: "/archives", icon: <BsFolder2Open /> },
  { label: "Tags", to: "/tags", icon: <BsTag /> }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-60 bg-[#21252b] overflow-y-auto shrink-0">
      {/* Explorer Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#282c34]">
        <BsChevronRight className="w-3 h-3 text-[#5c6370]" />
        <span className="text-[10px] font-bold tracking-widest uppercase font-sans text-[#5c6370]">
          Netrw
        </span>
      </div>

      {/* Navigation Tree */}
      <nav className="flex flex-col py-1" aria-label="Main navigation">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-2 px-3 py-1.5 no-underline font-sans text-[13px] transition-all duration-150 border-l-2 ${
                isActive
                  ? "bg-[#2c313a] border-l-[#61afef] text-[#61afef]"
                  : "border-l-transparent text-[#abb2bf] hover:bg-[#2c313a] hover:border-l-[#5c6370]"
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              {/* Tree indent indicator */}
              <span className="w-3 flex items-center justify-center">
                {isActive ? (
                  <span className="w-1 h-1 rounded-full bg-[#61afef]"></span>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </span>

              {/* Icon */}
              <span
                className={`flex items-center transition-colors ${
                  isActive
                    ? "text-[#61afef]"
                    : "text-[#5c6370] group-hover:text-[#abb2bf]"
                }`}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Active indicator */}
              {isActive && (
                <span className="text-[10px] font-mono text-[#5c6370]">●</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Optional: File count or status */}
      <div className="mt-auto px-3 py-2 bg-[#1e2127]">
        <span className="text-[10px] font-mono text-[#5c6370]">
          {NAV_ITEMS.length} items
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;

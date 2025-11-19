import { Link } from "react-router-dom";

const Header = ({ blogName }) => {
  return (
    <header className="flex items-center justify-between px-0 py-0 h-8 select-none bg-[var(--color-titlebar-bg)] relative z-30">
      {/* Left Section - Brand */}
      <div className="flex items-center h-8 ml-14 md:ml-0">
        <Link
          to="/"
          className="flex items-center px-4 h-full no-underline transition-colors bg-[var(--color-accent-primary)] text-[var(--color-editor-bg)] font-sans text-sm font-bold hover:bg-[var(--color-accent-hover)]"
          aria-label="Go to homepage"
        >
          {blogName}
        </Link>

        {/* Separator */}
        <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-l-[10px] border-l-[var(--color-accent-primary)]"></div>
      </div>

      {/* Right Section - Optional Nav Items */}
      <div className="flex items-center h-8">
        {/* You can add navigation items here if needed */}
      </div>
    </header>
  );
};

export default Header;

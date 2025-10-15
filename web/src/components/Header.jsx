import { Link } from "react-router-dom";

const Header = ({ blogName }) => {
  return (
    <header className="flex items-center justify-between px-0 py-0 h-8 select-none bg-[#21252b]">
      {/* Left Section - Brand */}
      <div className="flex items-center h-8">
        <Link
          to="/"
          className="flex items-center px-4 h-full no-underline transition-colors bg-[#61afef] text-[#21252b] font-sans text-sm font-bold hover:bg-[#84c0f4]"
          aria-label="Go to homepage"
        >
          {blogName}
        </Link>

        {/* Separator */}
        <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-l-[10px] border-l-[#61afef]"></div>
      </div>

      {/* Right Section - Optional Nav Items */}
      <div className="flex items-center h-8">
        {/* You can add navigation items here if needed */}
      </div>
    </header>
  );
};

export default Header;

import { Link } from "react-router-dom";
import Navigation from "./Navigation";

const Header = ({ blogName }) => {
  return (
    <header className="w-full py-6 bg-transparent">
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-3xl mx-auto px-4 gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Go to homepage"
          >
            {blogName}
          </Link>
        </h1>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;

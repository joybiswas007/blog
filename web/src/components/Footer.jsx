import { Link } from "react-router-dom";
import { BsFolder } from "react-icons/bs";
import { SiGo } from "react-icons/si";
import { FaReact } from "react-icons/fa";

const Footer = ({ authorName, sourceCode }) => {
  return (
    <footer className="w-full py-6 mt-8 bg-transparent">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 text-sm text-[var(--color-text-primary)] font-mono gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <span>
            &copy; {new Date().getFullYear()} {authorName}
          </span>
          {sourceCode && (
            <Link
              to={sourceCode}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              tabIndex={0}
              aria-label="View source code on external site"
            >
              <BsFolder className="text-blue-500 mr-1" />
              Source
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <span>Powered by</span>
          <SiGo size={24} className="text-blue-400" />
          <span>+</span>
          <FaReact size={20} className="text-blue-400" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

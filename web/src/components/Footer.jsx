import { Link } from "react-router-dom";

const Footer = ({ authorName, sourceCode }) => {
  return (
    <footer className="w-full py-6 mt-8 bg-transparent">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 text-sm text-[var(--color-text-primary)] font-mono">
        <div className="flex items-center gap-2">
          <span>
            &copy; {new Date().getFullYear()} {authorName}
          </span>
          {sourceCode && (
            <>
              <span>|</span>
              <Link
                to={sourceCode}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-300 transition-colors"
                tabIndex={0}
                aria-label="View source code on external site"
              >
                Source
              </Link>
            </>
          )}
        </div>
        <span className="mt-2 sm:mt-0">Powered by Go + React</span>
      </div>
    </footer>
  );
};

export default Footer;

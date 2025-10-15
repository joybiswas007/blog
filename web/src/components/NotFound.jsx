import { Link } from "react-router-dom";
import {
  BsHouseDoor,
  BsArrowLeft,
  BsExclamationTriangle
} from "react-icons/bs";
import SEO from "./SEO";

const NotFound = () => {
  return (
    <>
      <SEO title="404 - Page Not Found" />
      <div className="flex items-center justify-center min-h-full py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          {/* Error Icon */}
          <div className="flex items-center justify-center mx-auto mb-6 w-20 h-20 rounded-full bg-[rgba(220,38,38,0.1)] text-[#dc2626] text-[40px]">
            <BsExclamationTriangle />
          </div>

          {/* 404 Code */}
          <div className="text-8xl font-bold mb-4 font-mono text-[var(--color-accent-primary)] leading-none shadow-[0_0_20px_rgba(0,122,204,0.3)]">
            404
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4 font-sans text-[var(--color-text-primary)]">
            Page Not Found
          </h1>
          <p className="text-base max-w-lg mx-auto mb-8 font-sans text-[var(--color-text-secondary)] leading-relaxed">
            The file you're looking for doesn't exist in this directory. It may
            have been moved, deleted, or the path is incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded no-underline transition-all font-sans text-[14px] font-medium border bg-[var(--color-accent-primary)] text-white border-[var(--color-accent-primary)] cursor-pointer hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,122,204,0.3)]"
            >
              <BsHouseDoor className="text-base" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded no-underline transition-all font-sans text-[14px] font-medium border bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border-[var(--color-panel-border)] cursor-pointer hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] hover:-translate-y-px"
              aria-label="Go back to previous page"
              type="button"
            >
              <BsArrowLeft className="text-base" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Error Details (IDE-style) */}
          <div className="mt-12 p-4 rounded bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] font-mono text-[13px] text-left max-w-[500px] mx-auto">
            <div className="flex items-baseline gap-2 py-1">
              <span className="text-[var(--color-text-secondary)] min-w-[100px]">
                Error Code:
              </span>
              <span className="text-[var(--color-accent-primary)] break-all">
                HTTP 404
              </span>
            </div>
            <div className="flex items-baseline gap-2 py-1">
              <span className="text-[var(--color-text-secondary)] min-w-[100px]">
                Location:
              </span>
              <span className="text-[var(--color-accent-primary)] break-all">
                {window.location.pathname}
              </span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="pt-8 mt-8 border-t border-[var(--color-panel-border)]">
            <p className="text-sm font-sans text-[var(--color-text-secondary)]">
              💡 Tip: Check the URL for typos or use the navigation menu
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

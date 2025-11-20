import { Link } from "react-router-dom";
import {
  BsHouseDoor,
  BsArrowLeft,
  BsExclamationTriangle
} from "react-icons/bs";
import SEO from "@/components/SEO";

const NotFound = () => {
  return (
    <>
      <SEO title="404 - Page Not Found" />
      <div className="flex items-center justify-center min-h-full py-8">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6">
          {/* Error Icon */}
          <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-full bg-[rgba(224,108,117,0.15)] text-[#e06c75] text-[32px]">
            <BsExclamationTriangle />
          </div>

          {/* 404 Code */}
          <div className="text-7xl font-bold mb-3 font-mono text-[#61afef] leading-none">
            404
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold mb-3 font-sans text-[#abb2bf]">
            Page Not Found
          </h1>
          <p className="text-sm max-w-lg mx-auto mb-6 font-sans text-[#5c6370] leading-relaxed">
            The file you're looking for doesn't exist in this directory. It may
            have been moved, deleted, or the path is incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all font-sans text-[14px] font-medium bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(97,175,239,0.3)]"
            >
              <BsHouseDoor className="text-base" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all font-sans text-[14px] font-medium bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] hover:-translate-y-px"
              aria-label="Go back to previous page"
              type="button"
            >
              <BsArrowLeft className="text-base" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Error Details (IDE-style) */}
          <div className="mt-8 p-3 rounded bg-[#21252b] border border-[#2c313a] font-mono text-[12px] text-left max-w-[500px] mx-auto">
            <div className="flex items-baseline gap-2 py-1">
              <span className="text-[#5c6370] min-w-[90px]">Error Code:</span>
              <span className="text-[#e06c75] break-all">HTTP 404</span>
            </div>
            <div className="flex items-baseline gap-2 py-1">
              <span className="text-[#5c6370] min-w-[90px]">Location:</span>
              <span className="text-[#61afef] break-all">
                {window.location.pathname}
              </span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="pt-6 mt-6 border-t border-t-[#2c313a]">
            <p className="text-xs font-sans text-[#5c6370]">
              💡 Tip: Check the URL for typos or use the navigation menu
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

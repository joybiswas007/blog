import { Link } from "react-router-dom";
import SEO from "./SEO";

const NotFound = () => {
  return (
    <div className="flex justify-center w-full">
      <SEO title="404" />
      <div className="w-full max-w-2xl text-center space-y-8 py-12">
        {/* 404 Header */}
        <div className="space-y-4">
          <h1 className="text-9xl font-heading font-bold text-blue-400 mb-4">
            404
          </h1>
          <h2 className="text-4xl font-heading font-bold text-[var(--color-text-primary)]">
            Page Not Found
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] font-mono max-w-md mx-auto">
            Sorry, couldn't find the page you're looking for. It might have been
            moved or deleted.
          </p>
        </div>

        {/* Small Navigation Links */}
        <div className="space-y-6">
          <p className="text-[var(--color-text-secondary)] font-mono text-base">
            Here are some things you can try:
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors underline-offset-4 hover:underline text-lg"
            >
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors underline-offset-4 hover:underline bg-transparent border-none cursor-pointer p-0 text-lg"
              aria-label="Go back to previous page"
              type="button"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-sm text-[var(--color-text-secondary)] font-mono opacity-80">
            Have you tried turning your device or browser off and on again?
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

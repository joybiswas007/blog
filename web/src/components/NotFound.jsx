import { Link } from "react-router-dom";
import Title from "../components/Title";

const NotFound = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;

  return (
    <div className="flex justify-center w-full">
      <Title title={`404 - ${blogName}`} />
      <div className="w-full max-w-2xl text-center space-y-6 py-8">
        {/* 404 Header */}
        <div className="space-y-4">
          <h1 className="text-8xl font-heading font-bold text-blue-400 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-heading font-bold text-[var(--color-text-primary)]">
            Page Not Found
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] font-mono max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        {/* ASCII Art */}
        <div className="text-blue-400 font-mono text-2xl py-2">
          <pre>{`¯\\_(ツ)_/¯`}</pre>
        </div>

        {/* Small Navigation Links */}
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)] font-mono text-sm">
            Here are some things you can try:
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors underline-offset-4 hover:underline"
            >
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors underline-offset-4 hover:underline bg-transparent border-none cursor-pointer p-0"
              aria-label="Go back to previous page"
              type="button"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-[var(--color-text-secondary)] font-mono opacity-70">
            Have you tried turning your device or browser off and on again?
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

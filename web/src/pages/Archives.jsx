import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/archives");
      setArchives(response.data?.archives || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch archives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)]">
          Loading archives...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <title>{`Archives - ${import.meta.env.VITE_BLOG_NAME}`}</title>
      <div className="space-y-10 w-full max-w-3xl">
        <div className="pl-4 ml-2 space-y-10">
          {/* Feed section */}
          <section className="space-y-2">
            <p className="flex items-baseline gap-2">
              <span className="text-blue-500 text-lg">&gt;</span>
              <span>Blog feed available at:</span>
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="/rss.xml"
              className="inline-flex items-center gap-2 font-mono text-blue-400 hover:text-blue-300 transition-colors"
              tabIndex={0}
              aria-label="Open RSS feed in new tab"
            >
              <span className="text-blue-400 text-lg">&gt;</span>
              <span>/rss.xml</span>
            </a>
          </section>

          {/* Archives by year */}
          <section className="space-y-3">
            <h2 className="text-lg text-[var(--color-text-primary)] font-heading">
              By year
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
              {archives && archives.length > 0 ? (
                archives.map((list, index) => (
                  <Link
                    key={index}
                    to={`/archives/${list.year}`}
                    className="group flex items-center gap-2 font-mono text-blue-200 hover:text-blue-300 transition-colors"
                    tabIndex={0}
                    aria-label={`View archives for year ${list.year} with ${list.post_count} posts`}
                  >
                    <span className="text-blue-400 text-lg">&gt;</span>
                    <span>
                      {list.year}
                      <span className="text-[var(--color-text-secondary)] text-xs ml-1 group-hover:text-blue-300 transition-colors">
                        ({list.post_count})
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <div className="flex items-baseline gap-2 text-[var(--color-text-secondary)]">
                  <span className="text-blue-500">&gt;</span>
                  <p>No archives found</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Archives;

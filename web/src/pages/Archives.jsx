import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import SEO from "@/components/SEO";
import { BsFire } from "react-icons/bs";

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topPosts, setTopPosts] = useState([]);
  const [topError, setTopError] = useState("");

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

  // Fetch top posts
  const fetchTopPosts = async () => {
    setTopError("");
    try {
      const response = await api.get("/posts/top-posts");
      setTopPosts(response.data.top_posts || []); // Ensure array fallback
    } catch (err) {
      setTopError(err.response?.data?.error || "Failed to fetch top posts");
    }
  };

  useEffect(() => {
    fetchArchives();
    fetchTopPosts();
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
      <SEO title="Archives" />
      <div className="space-y-6 w-full max-w-3xl">
        <div className="pl-4 space-y-6">
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

          {/* Top Posts Section */}
          <section className="space-y-3">
            <h2 className="text-lg text-[var(--color-text-primary)] font-heading flex items-center gap-2">
              <BsFire className="text-orange-500" /> Top 10 Posts
            </h2>
            {topError ? (
              <p className="text-red-500 font-mono text-sm">{topError}</p>
            ) : topPosts && topPosts.length > 0 ? (
              <ul className="space-y-1 font-mono text-sm">
                {topPosts.map((topPost, index) => (
                  <li key={topPost.id} className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold">
                      #{index + 1}
                    </span>
                    <Link
                      to={`/posts/${topPost.slug}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                      aria-label={`Read top post: ${topPost.title}`}
                    >
                      {topPost.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--color-text-secondary)] font-mono text-sm">
                No top posts available.
              </p>
            )}
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

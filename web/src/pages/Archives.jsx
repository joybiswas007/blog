import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import SEO from "@/components/SEO";
import { BsFire, BsRss } from "react-icons/bs";

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
      const errorMessage = error.response?.data?.error;
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to fetch archives"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPosts = async () => {
    setTopError("");
    try {
      const response = await api.get("/posts/top-posts");
      setTopPosts(response.data.top_posts || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      setTopError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to fetch top posts"
      );
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
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-4xl font-heading font-bold text-blue-300 mb-4">
          Archives
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: RSS and Archives by Year */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <BsRss className="text-orange-500" /> RSS Feed
              </h2>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to="/rss.xml"
                className="inline-flex items-center gap-2 font-mono text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>/rss.xml</span>
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-blue-300 mb-4">
                By Year
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {archives && archives.length > 0 ? (
                  archives.map((list, index) => (
                    <Link
                      key={index}
                      to={`/archives/${list.year}`}
                      className="group flex items-center gap-2 font-mono text-blue-200 hover:text-blue-300 transition-colors text-lg"
                    >
                      <span className="text-blue-400 text-xl">&gt;</span>
                      <span>
                        {list.year}
                        <span className="text-[var(--color-text-secondary)] text-sm ml-1 group-hover:text-blue-300 transition-colors">
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

          {/* Right Column: Top Posts */}
          <div className="md:col-span-1">
            <section>
              <h2 className="text-2xl font-heading font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <BsFire className="text-orange-500" /> Top Posts
              </h2>
              {topError ? (
                <p className="text-red-500 font-mono text-sm">{topError}</p>
              ) : topPosts && topPosts.length > 0 ? (
                <ul className="space-y-2">
                  {topPosts.map(topPost => (
                    <li key={topPost.id}>
                      <Link
                        to={`/posts/${topPost.slug}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors truncate font-mono text-sm"
                      >
                        {topPost.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-400">No top posts available.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archives;

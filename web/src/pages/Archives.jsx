import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsFire,
  BsRss,
  BsFolder2Open,
  BsFileText,
  BsChevronRight
} from "react-icons/bs";
import api from "@/services/api";
import SEO from "@/components/SEO";

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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-8 h-8 border-[3px] border-t-transparent border-[#61afef] rounded-full animate-spin mb-3"></div>
        <div className="text-[13px] font-mono text-[#5c6370]">
          Loading archives...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 px-4 py-3 rounded border-l-4 bg-[rgba(224,108,117,0.1)] border-l-[#e06c75] text-[#e06c75] font-mono text-[13px]">
        {error}
      </div>
    );
  }

  return (
    <>
      <SEO title="Archives" />
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* RSS Feed Section */}
        <section className="border border-[#181a1f] rounded overflow-hidden bg-[#21252b]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#282c34] border-b border-[#181a1f]">
            <BsRss className="w-3.5 h-3.5 text-[#e5c07b]" />
            <h2 className="text-[13px] font-semibold font-sans text-[#abb2bf]">
              RSS Feed
            </h2>
          </div>
          <div className="p-4">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              to="/rss.xml"
              className="inline-flex items-center gap-2 px-3 py-2 rounded no-underline transition-all bg-[#2c313a] border border-[#181a1f] text-[#abb2bf] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
            >
              <BsRss className="w-3.5 h-3.5" />
              <span className="font-mono text-[13px]">/rss.xml</span>
            </Link>
          </div>
        </section>

        {/* Top Posts Section */}
        <section className="border border-[#181a1f] rounded overflow-hidden bg-[#21252b]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#282c34] border-b border-[#181a1f]">
            <BsFire className="w-3.5 h-3.5 text-[#e06c75]" />
            <h2 className="text-[13px] font-semibold font-sans text-[#abb2bf]">
              Top Posts
            </h2>
          </div>
          <div className="p-0">
            {topError ? (
              <div className="m-4 px-4 py-3 rounded border-l-4 bg-[rgba(224,108,117,0.1)] border-l-[#e06c75] text-[#e06c75] font-mono text-[13px]">
                {topError}
              </div>
            ) : topPosts && topPosts.length > 0 ? (
              <div className="space-y-0">
                {topPosts.map((topPost, index) => (
                  <Link
                    key={topPost.id}
                    to={`/posts/${topPost.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 no-underline transition-all bg-transparent border-l-2 border-l-transparent border-b border-b-[#181a1f] last:border-b-0 hover:bg-[#2c313a] hover:border-l-[#61afef]"
                  >
                    {/* Rank badge */}
                    <span className="flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold font-mono bg-[#61afef] text-[#21252b] shrink-0">
                      {index + 1}
                    </span>

                    {/* Tree indent */}
                    <span className="w-3 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </span>

                    {/* File icon */}
                    <BsFileText className="w-3.5 h-3.5 text-[#5c6370] group-hover:text-[#61afef] transition-colors shrink-0" />

                    {/* Title */}
                    <span className="flex-1 text-[14px] font-sans text-[#abb2bf] group-hover:text-[#61afef] transition-colors">
                      {topPost.title}
                    </span>

                    {/* Arrow */}
                    <BsChevronRight className="w-3 h-3 text-[#5c6370] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[13px] font-sans text-[#5c6370]">
                No top posts available
              </div>
            )}
          </div>
        </section>

        {/* Archives by Year Section */}
        <section className="border border-[#181a1f] rounded overflow-hidden bg-[#21252b]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#282c34] border-b border-[#181a1f]">
            <BsFolder2Open className="w-3.5 h-3.5 text-[#e5c07b]" />
            <h2 className="text-[13px] font-semibold font-sans text-[#abb2bf]">
              By Year
            </h2>
          </div>
          <div className="p-4">
            {archives && archives.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {archives.map((list, index) => (
                  <Link
                    key={index}
                    to={`/archives/${list.year}`}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded no-underline transition-all bg-[#2c313a] border border-[#181a1f] border-l-2 border-l-transparent hover:bg-[#353b45] hover:border-l-[#61afef]"
                  >
                    <BsFolder2Open className="w-4 h-4 text-[#e5c07b] shrink-0" />
                    <span className="flex-1 font-sans text-[14px] font-medium text-[#abb2bf] group-hover:text-[#61afef] transition-colors">
                      {list.year}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#353b45] text-[#5c6370] border border-[#181a1f] shrink-0">
                      {list.post_count}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[13px] font-sans text-[#5c6370]">
                No archives found
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Archives;

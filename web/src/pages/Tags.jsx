import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsTag, BsChevronRight } from "react-icons/bs";
import api from "@/services/api";
import SEO from "@/components/SEO";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/tags");
      setTags(response.data?.tags || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-[var(--color-editor-bg)] border-b border-b-[var(--color-hover-bg)]">
          <div className="h-3 w-3 bg-[var(--color-hover-bg)] rounded animate-shimmer"></div>
          <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-20"></div>
        </div>

        {/* Tags list skeleton */}
        <div className="space-y-0 border border-[var(--color-hover-bg)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-b-[var(--color-editor-bg)] last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[var(--color-hover-bg)] rounded-full animate-shimmer"></div>
                <div className="h-4 bg-[var(--color-hover-bg)] rounded animate-shimmer w-24"></div>
              </div>
              <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 px-4 py-3 rounded-l-none bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[var(--color-syntax-variable)] text-[var(--color-syntax-variable)] font-mono text-[13px]">
        {error}
      </div>
    );
  }

  return (
    <>
      <SEO title="Tags" />
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-[var(--color-editor-bg)] border-b border-b-[var(--color-hover-bg)]">
          <BsChevronRight className="w-3 h-3 text-[#5c6370]" />
          <h1 className="text-[10px] font-bold tracking-widest uppercase font-sans text-[#5c6370]">
            All Tags
          </h1>
        </div>

        {tags && tags.length > 0 ? (
          <div className="space-y-0 border border-[var(--color-hover-bg)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]">
            {tags.map((tag, index) => (
              <Link
                key={index}
                to={`/?tag=${tag.name}`}
                className="group flex items-center justify-between px-4 py-3 no-underline transition-all bg-transparent border-l-2 border-l-transparent border-b border-b-[#282c34] last:border-b-0 hover:bg-[#2c313a] hover:border-l-[#61afef]"
                aria-label={`View ${tag.post_count} posts tagged with ${tag.name}`}
              >
                <div className="flex items-center gap-3">
                  {/* Tree indent indicator */}
                  <span className="w-3 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </span>

                  {/* Tag icon */}
                  <BsTag className="w-3.5 h-3.5 text-[#5c6370] group-hover:text-[#61afef] transition-colors" />

                  {/* Tag name */}
                  <span className="font-medium text-[14px] font-sans text-[#abb2bf] group-hover:text-[#61afef] transition-colors">
                    {tag.name}
                  </span>
                </div>

                {/* Post count badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-[#2c313a] text-[#5c6370] border border-[#353b45]">
                    {tag.post_count} {tag.post_count === 1 ? "post" : "posts"}
                  </span>
                  <BsChevronRight className="w-3 h-3 text-[#5c6370] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-hover-bg)] mb-4">
              <BsTag className="w-7 h-7 text-[#5c6370]" />
            </div>
            <h2 className="text-base font-medium mb-2 font-sans text-[#abb2bf]">
              No tags found
            </h2>
            <p className="text-[13px] text-[#5c6370] leading-relaxed">
              Tags will appear here once you create posts with tags.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Tags;

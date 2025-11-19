import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BsFileText,
  BsArrowLeft,
  BsChevronRight,
  BsCalendar3
} from "react-icons/bs";
import api from "@/services/api";
import SEO from "@/components/SEO";

const ArchiveByYear = () => {
  const { year } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArchiveByYear = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/archives/${year}`);
      setPosts(response.data?.archive?.posts || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [year]);

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getMonthName = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long"
    });
  };

  // Group posts by month
  const groupPostsByMonth = posts => {
    const grouped = {};
    posts.forEach(post => {
      const month = getMonthName(post.created_at);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(post);
    });
    return grouped;
  };

  useEffect(() => {
    fetchArchiveByYear();
  }, [fetchArchiveByYear]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Year Header skeleton */}
        <div className="flex items-center justify-between px-4 py-3 mb-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-hover-bg)] rounded">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer"></div>
            <div className="h-6 bg-[var(--color-hover-bg)] rounded animate-shimmer w-20"></div>
          </div>
          <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer w-16"></div>
        </div>

        {/* Month sections skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--color-hover-bg)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]">
              {/* Month header skeleton */}
              <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-editor-bg)] border-b border-b-[var(--color-hover-bg)]">
                <div className="h-4 bg-[var(--color-hover-bg)] rounded animate-shimmer w-24"></div>
                <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer w-8"></div>
              </div>

              {/* Posts list skeleton */}
              <div className="space-y-0">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3 px-4 py-3 border-b border-b-[var(--color-editor-bg)] last:border-b-0">
                    <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-12"></div>
                    <div className="w-3 h-3 bg-[var(--color-hover-bg)] rounded-full animate-shimmer"></div>
                    <div className="h-4 bg-[var(--color-hover-bg)] rounded animate-shimmer flex-1"></div>
                  </div>
                ))}
              </div>
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

  const groupedPosts = posts.length > 0 ? groupPostsByMonth(posts) : {};
  const months = Object.keys(groupedPosts);

  return (
    <>
      <SEO title={`Archives - ${year}`} />
      <div className="w-full max-w-3xl mx-auto">
        {/* Year Header */}
        <div className="flex items-center justify-between px-4 py-3 mb-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-hover-bg)] rounded">
          <div className="flex items-center gap-3">
            <BsCalendar3 className="w-5 h-5 text-[#61afef]" />
            <h1 className="text-xl font-bold font-sans text-[#abb2bf]">
              {year}
            </h1>
          </div>
          <span className="px-3 py-1 rounded text-[11px] font-mono bg-[#2c313a] text-[#5c6370] border border-[#353b45]">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {months.map((month, monthIndex) => (
              <div
                key={monthIndex}
                className="border border-[var(--color-hover-bg)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]"
              >
                {/* Month Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-editor-bg)] border-b border-b-[var(--color-hover-bg)]">
                  <h2 className="text-[13px] font-semibold font-sans text-[#abb2bf]">
                    {month}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#2c313a] text-[#5c6370] border border-[#353b45]">
                    {groupedPosts[month].length}
                  </span>
                </div>

                {/* Posts List */}
                <div className="space-y-0">
                  {groupedPosts[month].map((post, postIndex) => (
                    <Link
                      key={postIndex}
                      to={`/posts/${post.slug}`}
                      className="group flex items-center gap-3 px-4 py-3 no-underline transition-all bg-transparent border-l-2 border-l-transparent border-b border-b-[#282c34] last:border-b-0 hover:bg-[#2c313a] hover:border-l-[#61afef]"
                    >
                      {/* Date */}
                      <span className="text-[11px] font-mono text-[#5c6370] min-w-[50px] shrink-0">
                        {formatDate(post.created_at)}
                      </span>

                      {/* Tree indent */}
                      <span className="w-3 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </span>

                      {/* File icon */}
                      <BsFileText className="w-3.5 h-3.5 text-[#5c6370] group-hover:text-[#61afef] transition-colors shrink-0" />

                      {/* Title */}
                      <span className="flex-1 text-[14px] font-sans text-[#abb2bf] group-hover:text-[#61afef] transition-colors">
                        {post.title}
                      </span>

                      {/* Arrow */}
                      <BsChevronRight className="w-3 h-3 text-[#5c6370] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-hover-bg)] mb-4">
              <BsCalendar3 className="w-7 h-7 text-[#5c6370]" />
            </div>
            <h3 className="text-base font-medium mb-2 font-sans text-[#abb2bf]">
              No posts found
            </h3>
            <p className="text-[13px] text-[#5c6370]">
              No posts were published in {year}.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 pt-6 border-t border-t-[#2c313a]">
          <Link
            to="/archives"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all font-sans text-[13px] bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
          >
            <BsArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Archives</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ArchiveByYear;

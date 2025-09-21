import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import { CalculateReadTime } from "@/utils/helpers";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SEO from "@/components/SEO";
import { BsCalendar, BsClock, BsPencil, BsTags } from "react-icons/bs";

const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const response = await api.get(`/posts/${slug}`);
      const { post: currentPost, next_post, previous_post } = response.data;
      setPost(currentPost);
      setPreviousPost(previous_post);
      setNextPost(next_post);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch post");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)] font-mono">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 font-mono">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)] font-mono">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.tags.join(", ")}
        ogType="article"
      />
      <article className="w-full max-w-3xl space-y-8 p-6">
        <header className="space-y-4">
          <h1 className="text-3xl text-[var(--color-text-primary)] font-heading">
            {post.title}
          </h1>
          <div className="text-[var(--color-text-secondary)] text-sm flex flex-wrap gap-4 items-center font-mono">
            <span className="flex items-center">
              <BsCalendar className="text-blue-500 mr-1" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center">
              <BsClock className="text-blue-500 mr-1" />
              {CalculateReadTime(post.content)}
            </span>
            <span className="flex items-center">
              <BsPencil className="text-blue-500 mr-1" />
              {post.author}
            </span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <BsTags className="text-blue-500" />
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/?tag=${tag}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    tabIndex={0}
                    aria-label={`Filter by tag ${tag}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-invert max-w-none pt-6">
          <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
        </div>

        <div className="pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {previousPost ? (
              <Link
                to={`/posts/${previousPost.slug}`}
                className="flex items-center text-[var(--color-text-primary)] hover:text-blue-300 group w-full sm:w-auto p-3 transition-colors rounded"
                tabIndex={0}
                aria-label={`Previous post: ${previousPost.title}`}
              >
                <span className="text-blue-500 mr-2 group-hover:-translate-x-1 transition-transform">
                  ←
                </span>
                <div className="truncate max-w-xs">
                  <span className="text-xs text-blue-500 block">Previous</span>
                  <span className="font-medium">{previousPost.title}</span>
                </div>
              </Link>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}

            {nextPost ? (
              <Link
                to={`/posts/${nextPost.slug}`}
                className="flex items-center text-[var(--color-text-primary)] hover:text-blue-300 group w-full sm:w-auto p-3 transition-colors rounded justify-end"
                tabIndex={0}
                aria-label={`Next post: ${nextPost.title}`}
              >
                <div className="truncate max-w-xs text-right">
                  <span className="text-xs text-blue-500 block">Next</span>
                  <span className="font-medium">{nextPost.title}</span>
                </div>
                <span className="text-blue-500 ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default Post;

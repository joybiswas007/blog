import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { CalculateReadTime, formatDate } from "@/utils/helpers";
const Markdown = lazy(() => import("react-markdown"));
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import SEO from "@/components/SEO";
import {
  TwitterShareButton,
  LinkedinShareButton,
  BlueskyShareButton,
  TwitterIcon,
  LinkedinIcon,
  BlueskyIcon
} from "react-share";
import { BsChevronLeft, BsChevronRight, BsShare } from "react-icons/bs";
import "highlight.js/styles/atom-one-dark.css";

// Utility function to generate heading IDs from text
const generateHeadingId = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Custom heading component for react-markdown with anchor support
const HeadingRenderer = ({ level, children, ...props }) => {
  const text = children?.toString() || "";
  const id = generateHeadingId(text);
  const Tag = `h${level}`;

  return (
    <Tag id={id} {...props}>
      <Link
        to={`#${id}`}
        className="heading-anchor"
        aria-label={`Link to ${text}`}
      >
        {children}
      </Link>
    </Tag>
  );
};

// Scroll to hash on mount and hash change
const useScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          const editorPane = document.getElementById("editor-pane");
          if (editorPane) {
            const elementTop = element.offsetTop;
            editorPane.scrollTo({ top: elementTop - 20, behavior: "smooth" });
          } else {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 100);
    }
  }, [location.hash]);
};

const SocialShare = ({ url, title }) => (
  <div className="flex items-center gap-4 py-4 my-8 border-y border-y-[#2c313a]">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2c313a] border border-[#353b45] rounded">
      <BsShare className="w-3.5 h-3.5 text-[#61afef]" />
      <span className="text-[11px] font-semibold font-sans text-[#5c6370] uppercase tracking-wider">
        Share
      </span>
    </div>
    <div className="flex items-center gap-2">
      <TwitterShareButton url={url} title={title}>
        <div className="w-8 h-8 flex items-center justify-center rounded transition-all bg-[#2c313a] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]">
          <TwitterIcon size={20} round />
        </div>
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <div className="w-8 h-8 flex items-center justify-center rounded transition-all bg-[#2c313a] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]">
          <LinkedinIcon size={20} round />
        </div>
      </LinkedinShareButton>
      <BlueskyShareButton url={url} title={title}>
        <div className="w-8 h-8 flex items-center justify-center rounded transition-all bg-[#2c313a] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]">
          <BlueskyIcon size={20} round />
        </div>
      </BlueskyShareButton>
    </div>
  </div>
);

const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useScrollToHash();

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

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-8 h-8 border-[3px] border-t-transparent border-[#61afef] rounded-full animate-spin mb-3"></div>
        <div className="text-[13px] font-mono text-[#5c6370]">
          Loading post...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-[13px] font-mono text-[#e06c75]">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-[13px] font-mono text-[#5c6370]">
          Post not found
        </div>
      </div>
    );
  }

  const postUrl = window.location.href;

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.tags.join(", ")}
        ogType="article"
      />
      <article className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <header className="space-y-5 pb-6 mb-8 border-b border-b-[#2c313a]">
          <h1 className="text-3xl font-bold leading-tight font-sans text-[#abb2bf] tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-[13px] font-mono text-[#5c6370]">
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>{CalculateReadTime(post.content)}</span>
            <span>·</span>
            <span>{post.author}</span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/?tag=${tag}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] no-underline font-mono bg-[rgba(97,175,239,0.1)] text-[#61afef] border border-[rgba(97,175,239,0.2)] transition-all duration-150 hover:bg-[rgba(97,175,239,0.2)] hover:border-[#61afef] hover:-translate-y-px"
                  aria-label={`Filter by tag ${tag}`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <Suspense
          fallback={
            <div className="prose">
              <div className="text-[13px] font-mono text-[#5c6370] animate-pulse">
                Loading content...
              </div>
            </div>
          }
        >
          <div className="prose">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeHighlight,
                [
                  rehypeExternalLinks,
                  {
                    target: "_blank",
                    rel: ["noopener", "noreferrer"]
                  }
                ]
              ]}
              components={{
                h1: props => <HeadingRenderer level={1} {...props} />,
                h2: props => <HeadingRenderer level={2} {...props} />,
                h3: props => <HeadingRenderer level={3} {...props} />,
                h4: props => <HeadingRenderer level={4} {...props} />,
                h5: props => <HeadingRenderer level={5} {...props} />,
                h6: props => <HeadingRenderer level={6} {...props} />
              }}
            >
              {post.content}
            </Markdown>
          </div>
        </Suspense>

        {/* Social Share */}
        <SocialShare url={postUrl} title={post.title} />

        {/* Navigation */}
        <nav className="pt-8 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {previousPost ? (
              <Link
                to={`/posts/${previousPost.slug}`}
                className="group flex items-center gap-3 p-4 rounded no-underline transition-all min-h-[80px] bg-[#2c313a] border border-[#353b45] justify-start hover:bg-[#353b45] hover:border-[#61afef]"
                aria-label={`Previous post: ${previousPost.title}`}
              >
                <BsChevronLeft className="shrink-0 w-5 h-5 text-[#61afef] transition-transform duration-200 group-hover:-translate-x-1" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold mb-1.5 text-[#5c6370] uppercase tracking-wider">
                    Previous
                  </div>
                  <div className="font-medium text-[13px] leading-tight font-sans line-clamp-2 text-[#abb2bf]">
                    {previousPost.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}

            {nextPost ? (
              <Link
                to={`/posts/${nextPost.slug}`}
                className="group flex items-center gap-3 p-4 rounded no-underline transition-all min-h-[80px] bg-[#2c313a] border border-[#353b45] justify-end text-right hover:bg-[#353b45] hover:border-[#61afef]"
                aria-label={`Next post: ${nextPost.title}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold mb-1.5 text-[#5c6370] uppercase tracking-wider">
                    Next
                  </div>
                  <div className="font-medium text-[13px] leading-tight font-sans line-clamp-2 text-[#abb2bf]">
                    {nextPost.title}
                  </div>
                </div>
                <BsChevronRight className="shrink-0 w-5 h-5 text-[#61afef] transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </nav>
      </article>
    </>
  );
};

export default Post;

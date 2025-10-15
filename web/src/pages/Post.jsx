import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { CalculateReadTime, formatDate } from "@/utils/helpers";
const Markdown = lazy(() => import("react-markdown"));
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import SEO from "@/components/SEO";
import {
  TwitterShareButton,
  LinkedinShareButton,
  BlueskyShareButton,
  TwitterIcon,
  LinkedinIcon,
  BlueskyIcon
} from "react-share";
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
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.hash]);
};

const SocialShare = ({ url, title }) => (
  <div className="post-social-share">
    <span className="post-share-label">Share</span>
    <div className="post-share-buttons">
      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <BlueskyShareButton url={url} title={title}>
        <BlueskyIcon size={32} round />
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
      <div className="post-loading">
        <div className="post-loading-spinner"></div>
        <div className="post-loading-text">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-error">
        <div className="post-error-text">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-not-found">
        <div className="post-not-found-text">Post not found</div>
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
      <article className="post-container">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>

          <div className="post-meta">
            <span className="post-meta-item">
              {formatDate(post.created_at)}
            </span>
            <span className="post-meta-separator">·</span>
            <span className="post-meta-item">
              {CalculateReadTime(post.content)}
            </span>
            <span className="post-meta-separator">·</span>
            <span className="post-meta-item">{post.author}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags-container">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/?tag=${tag}`}
                  className="post-tag-link"
                  aria-label={`Filter by tag ${tag}`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <Suspense
          fallback={
            <div className="prose">
              <div className="post-loading-text animate-pulse">
                Loading content...
              </div>
            </div>
          }
        >
          <div className="prose">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
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

        <SocialShare url={postUrl} title={post.title} />

        <nav className="post-navigation">
          <div className="post-nav-grid">
            {previousPost ? (
              <Link
                to={`/posts/${previousPost.slug}`}
                className="post-nav-link prev"
                aria-label={`Previous post: ${previousPost.title}`}
              >
                <span className="post-nav-arrow">←</span>
                <div className="post-nav-content">
                  <div className="post-nav-label">Previous</div>
                  <div className="post-nav-title">{previousPost.title}</div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}

            {nextPost ? (
              <Link
                to={`/posts/${nextPost.slug}`}
                className="post-nav-link next"
                aria-label={`Next post: ${nextPost.title}`}
              >
                <div className="post-nav-content">
                  <div className="post-nav-label">Next</div>
                  <div className="post-nav-title">{nextPost.title}</div>
                </div>
                <span className="post-nav-arrow">→</span>
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

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import api from "@/services/api";
import {
  FiGithub,
  FiLinkedin,
  FiMail,
  FiBookOpen,
  FiFolder,
  FiTag
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const Home = () => {
  const navigate = useNavigate();
  const author = "Joy Biswas";
  const email = "joybiswas040701@gmail.com";
  const github = "https://github.com/joybiswas007";
  const linkedin = "https://www.linkedin.com/in/joybtw";
  const twitter = "https://x.com/joybiswas1337";

  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Spaced Slant ASCII Logo for "JOY" to prevent letter overlap
  const asciiLogo = `
      _       ____      __  __ 
     | |     / __ \\     \\ \\/ / 
  _  | |    / /  \\ \\     \\  /  
 / |_| |   / /___/ /     / /   
 \\____/    \\____/_/     /_/    
  `;

  // Fetch the latest 5 posts on mount
  useEffect(() => {
    setLoading(true);
    api
      .get("/posts?limit=5&order_by=created_at&sort=DESC")
      .then(res => {
        setLatestPosts(res.data?.posts || []);
      })
      .catch(err => {
        console.error("Failed to fetch latest posts:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Bind keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      // Ignore if typing in input fields
      const activeEl = document.activeElement;
      const isInput =
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.tagName === "SELECT" ||
        activeEl.hasAttribute("contenteditable") ||
        activeEl.isContentEditable;
      if (isInput) return;

      switch (e.key.toLowerCase()) {
        case "p":
          e.preventDefault();
          navigate("/posts");
          break;
        case "a":
          e.preventDefault();
          navigate("/archives");
          break;
        case "t":
          e.preventDefault();
          navigate("/tags");
          break;
        case "g":
          e.preventDefault();
          window.open(github, "_blank", "noopener,noreferrer");
          break;
        case "l":
          e.preventDefault();
          window.open(linkedin, "_blank", "noopener,noreferrer");
          break;
        case "x":
          e.preventDefault();
          window.open(twitter, "_blank", "noopener,noreferrer");
          break;
        case "e":
          e.preventDefault();
          window.location.href = `mailto:${email}`;
          break;
        default:
          // Check for numeric keys 1-5 to navigate to latest posts
          const numKey = parseInt(e.key, 10);
          if (!isNaN(numKey) && numKey >= 1 && numKey <= 5) {
            if (latestPosts[numKey - 1]) {
              e.preventDefault();
              navigate(`/posts/${latestPosts[numKey - 1].slug}`);
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, latestPosts]);

  return (
    <>
      <SEO />

      <div className="flex flex-col items-center justify-center min-h-[75vh] font-mono text-xs text-[var(--color-text-primary)] space-y-8 select-none py-8 sm:py-12 animate-[fadeIn_0.2s_ease-out]">
        {/* ASCII Logo */}
        <pre className="text-[var(--color-accent-primary)] font-bold text-[10px] sm:text-xs leading-none select-none overflow-x-auto whitespace-pre max-w-full text-center px-4">
          {asciiLogo}
        </pre>

        {/* Startup Message / Greeting */}
        <div className="text-center space-y-1">
          <h1 className="text-sm font-bold text-[var(--color-text-primary)]">
            {author}
          </h1>
          <p className="text-[var(--color-syntax-string)]">Backend Developer</p>
        </div>

        {/* Actions Shortcuts Menu */}
        <div className="w-full max-w-md bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded-md p-4 space-y-1">
          <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider px-3 pb-2 border-b border-[var(--color-panel-border)] mb-2 select-none">
            Dashboard / Actions
          </div>

          {/* Action: View Posts */}
          <Link
            to="/posts"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-keyword)] font-bold">
                  p
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiBookOpen className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                View Posts
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Articles)
            </span>
          </Link>

          {/* Action: Archives */}
          <Link
            to="/archives"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-keyword)] font-bold">
                  a
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiFolder className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                Archives
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (File Tree)
            </span>
          </Link>

          {/* Action: Tags */}
          <Link
            to="/tags"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-keyword)] font-bold">
                  t
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiTag className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                Tags
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Labels)
            </span>
          </Link>

          <div className="my-2 border-t border-[var(--color-panel-border)]"></div>

          {/* Action: GitHub */}
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-constant)] font-bold">
                  g
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiGithub className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                GitHub
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Repositories)
            </span>
          </a>

          {/* Action: LinkedIn */}
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-constant)] font-bold">
                  l
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiLinkedin className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                LinkedIn
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Network)
            </span>
          </a>

          {/* Action: Twitter/X */}
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-constant)] font-bold">
                  x
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FaXTwitter className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                Twitter
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Thoughts)
            </span>
          </a>

          {/* Action: Email */}
          <a
            href={`mailto:${email}`}
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]">
                [
                <span className="text-[var(--color-syntax-constant)] font-bold">
                  e
                </span>
                ]
              </span>
              <span className="text-[var(--color-text-primary)] flex items-center gap-1.5">
                <FiMail className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)] w-4 h-4" />
                Email
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              (Contact)
            </span>
          </a>
        </div>

        {/* Recent Posts Section */}
        <div className="w-full max-w-md bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded-md p-4 space-y-1">
          <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider px-3 pb-2 border-b border-[var(--color-panel-border)] mb-2 select-none">
            Recent Posts / Files
          </div>

          {loading && (
            <div className="text-center py-4 text-[var(--color-text-muted)] animate-pulse select-none font-mono">
              Loading recent buffers...
            </div>
          )}

          {!loading && latestPosts.length === 0 && (
            <div className="text-center py-4 text-[var(--color-text-muted)] select-none font-mono">
              No recent files found.
            </div>
          )}

          {!loading &&
            latestPosts.length > 0 &&
            latestPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.slug}`}
                className="group flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--color-hover-bg)] no-underline transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] shrink-0">
                    [
                    <span className="text-[var(--color-syntax-keyword)] font-bold">
                      {index + 1}
                    </span>
                    ]
                  </span>
                  <span className="text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] truncate text-[11px]">
                    {post.title}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono shrink-0 ml-2">
                  ({post.created_at ? post.created_at.slice(0, 10) : ""})
                </span>
              </Link>
            ))}
        </div>

        {/* Footer info line */}
        <div className="text-[10px] text-[var(--color-text-muted)] text-center space-y-1">
          <div>
            joyblog v1.2.2 • Press{" "}
            <kbd className="text-[var(--color-syntax-keyword)] font-bold">
              /
            </kbd>{" "}
            anywhere to search
          </div>
          <div>
            Tip: Press key listed in brackets to trigger action instantly
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

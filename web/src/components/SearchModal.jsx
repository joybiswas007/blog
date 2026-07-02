import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Listen for global '/' key to open the search modal
  useEffect(() => {
    const handleGlobalKeyDown = e => {
      if (e.key === "/" && !isOpen) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.hasAttribute("contenteditable") ||
          activeEl.isContentEditable;
        if (!isInput) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen]);

  // Handle keys when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeys = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prevIndex =>
          results.length > 0 ? (prevIndex + 1) % results.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prevIndex =>
          results.length > 0
            ? (prevIndex - 1 + results.length) % results.length
            : 0
        );
      } else if (e.key === "Enter") {
        if (
          results.length > 0 &&
          selectedIndex >= 0 &&
          selectedIndex < results.length
        ) {
          e.preventDefault();
          const selected = results[selectedIndex];
          setIsOpen(false);
          navigate(`/posts/${selected.slug}`);
        }
      }
    };

    window.addEventListener("keydown", handleModalKeys);
    return () => window.removeEventListener("keydown", handleModalKeys);
  }, [isOpen, results, selectedIndex, navigate]);

  // Debounced search queries
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      api
        .get(`/posts/search?q=${encodeURIComponent(query)}`)
        .then(res => {
          setResults(res.data || []);
          setSelectedIndex(0);
        })
        .catch(err => {
          console.error("Search error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset and focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={() => setIsOpen(false)}
      id="search-modal-overlay"
    >
      <div
        className="w-full max-w-2xl bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-[fadeIn_0.15s_ease-out]"
        onClick={e => e.stopPropagation()}
        id="search-modal-container"
      >
        {/* Search Header */}
        <div className="relative flex items-center border-b border-[var(--color-panel-border)] bg-[var(--color-input-bg)]">
          <span className="pl-4 pr-2 font-mono text-[var(--color-accent-primary)] font-bold text-lg select-none">
            /
          </span>
          <input
            ref={inputRef}
            type="text"
            id="search-modal-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full pl-1 pr-4 py-3.5 bg-transparent text-[var(--color-text-primary)] font-mono text-sm focus:outline-none placeholder-[var(--color-text-muted)] border-none"
            autoComplete="off"
          />
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 bg-[var(--color-editor-bg)]">
          {loading && (
            <div className="p-8 text-center text-[var(--color-text-secondary)] font-mono text-xs animate-[pulse-glow_1.5s_infinite]">
              Searching codebase...
            </div>
          )}

          {!loading && query.trim() !== "" && results.length === 0 && (
            <div className="p-8 text-center text-[var(--color-text-secondary)] font-mono text-xs">
              No matching files or posts found.
            </div>
          )}

          {!loading && query.trim() === "" && (
            <div className="p-8 text-center text-[var(--color-text-muted)] font-mono text-xs">
              Type keywords to locate articles.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col py-1">
              {results.map((post, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Link
                    key={post.id}
                    to={`/posts/${post.slug}`}
                    id={`search-result-item-${index}`}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-start gap-3 px-4 py-3 border-l-2 no-underline transition-colors duration-150 ${
                      isSelected
                        ? "bg-[var(--color-hover-bg)] border-l-[var(--color-accent-primary)]"
                        : "border-l-transparent hover:bg-[var(--color-hover-bg)] hover:border-l-[var(--color-text-secondary)]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isSelected
                              ? "text-[var(--color-accent-primary)]"
                              : "text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]"
                          }`}
                        >
                          {post.title}
                        </span>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 shrink-0">
                            {post.tags.map(tag => (
                              <span
                                key={tag}
                                className="text-[10px] bg-[var(--color-titlebar-bg)] text-[var(--color-text-secondary)] rounded px-1.5 py-0.5 border border-[var(--color-panel-border)] font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {post.description && (
                        <p
                          className={`text-xs mt-1 truncate ${
                            isSelected
                              ? "text-[var(--color-text-primary)]"
                              : "text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 bg-[var(--color-titlebar-bg)] border-t border-[var(--color-panel-border)] flex justify-between items-center text-[10px] text-[var(--color-text-muted)] font-mono select-none"
          id="search-modal-footer"
        >
          <div className="flex items-center gap-3">
            <span>
              <span className="bg-[var(--color-hover-bg)] border border-[var(--color-panel-border)] px-1 rounded text-[var(--color-text-primary)] mr-1">
                ↑↓
              </span>
              Navigate
            </span>
            <span>
              <span className="bg-[var(--color-hover-bg)] border border-[var(--color-panel-border)] px-1 rounded text-[var(--color-text-primary)] mr-1">
                Enter
              </span>
              Open
            </span>
            <span>
              <span className="bg-[var(--color-hover-bg)] border border-[var(--color-panel-border)] px-1 rounded text-[var(--color-text-primary)] mr-1">
                Esc
              </span>
              Close
            </span>
          </div>
          <div>
            <span>
              Press <kbd className="text-[var(--color-accent-primary)]">/</kbd>{" "}
              globally to query
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

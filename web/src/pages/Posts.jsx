import { usePosts } from "@/hooks/usePosts";
import SEO from "@/components/SEO";
import SortingControls from "@/components/SortingControls";
import PostsList from "@/components/PostsList";
import PaginationControls from "@/components/PaginationControls";

const Posts = () => {
  const {
    posts,
    totalPost,
    loading,
    error,
    limit,
    offset,
    orderBy,
    sort,
    tag,
    selectedSort,
    currentPage,
    totalPages,
    buildQueryString,
    handleSortChange,
    formatDate
  } = usePosts();

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));
  };

  return (
    <>
      <SEO title="Posts" />
      <div className="space-y-6">
        {/* Vim-style search prompt banner */}
        <div
          onClick={triggerSearch}
          className="group flex items-center justify-between px-4 py-3 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded-md cursor-pointer transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-hover-bg)]"
          id="home-search-hint"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--color-accent-primary)] font-mono font-bold select-none text-base">
              /
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-150">
              Press{" "}
              <kbd className="font-mono bg-[var(--color-editor-bg)] border border-[var(--color-panel-border)] px-1.5 py-0.5 rounded text-[var(--color-accent-primary)] font-bold text-xs select-none">
                /
              </kbd>{" "}
              to search posts...
            </span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono group-hover:text-[var(--color-accent-primary)] transition-colors select-none">
            Search
          </span>
        </div>

        <SortingControls
          selectedSort={selectedSort}
          handleSortChange={handleSortChange}
          tag={tag}
          buildQueryString={buildQueryString}
          limit={limit}
          orderBy={orderBy}
          sort={sort}
        />

        <PostsList
          posts={posts}
          loading={loading}
          error={error}
          tag={tag}
          buildQueryString={buildQueryString}
          limit={limit}
          orderBy={orderBy}
          sort={sort}
          formatDate={formatDate}
        />

        <PaginationControls
          totalPost={totalPost}
          limit={limit}
          offset={offset}
          currentPage={currentPage}
          totalPages={totalPages}
          buildQueryString={buildQueryString}
          orderBy={orderBy}
          sort={sort}
          tag={tag}
        />
      </div>
    </>
  );
};

export default Posts;

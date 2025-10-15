import { usePosts } from "@/hooks/usePosts";
import SEO from "@/components/SEO";
import SortingControls from "@/components/SortingControls";
import PostsList from "@/components/PostsList";
import PaginationControls from "@/components/PaginationControls";

const Home = () => {
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

  return (
    <>
      <SEO />
      <div className="space-y-6">
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

export default Home;

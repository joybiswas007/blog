import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/api";

const DEFAULT_LIMIT = 10;
const SORT_OPTIONS = [
  { orderBy: "created_at", sort: "DESC", label: "Newest" },
  { orderBy: "created_at", sort: "ASC", label: "Oldest" },
  { orderBy: "title", sort: "ASC", label: "A-Z" }
];

const useQuery = () => {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
};

export const usePosts = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const limit = Number(query.limit) || DEFAULT_LIMIT;
  const offset = Number(query.offset) || 0;
  const orderBy = query.order_by || "created_at";
  const sort = query.sort || "DESC";
  const tag = query.tag || "";

  const [posts, setPosts] = useState([]);
  const [totalPost, setTotalPost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSort, setSelectedSort] = useState(
    SORT_OPTIONS.find(opt => opt.orderBy === orderBy && opt.sort === sort) ||
      SORT_OPTIONS[0]
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limit,
        offset,
        order_by: orderBy,
        sort
      };
      if (tag) params.tag = tag;
      const response = await api.get("/posts", { params });
      setPosts(response.data.posts || []);
      setTotalPost(response.data.total_post || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [limit, offset, orderBy, sort, tag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const buildQueryString = params => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        searchParams.set(key, value);
    });
    return `/?${searchParams.toString()}`;
  };

  const handleSortChange = e => {
    const selected = SORT_OPTIONS.find(opt => opt.label === e.target.value);
    setSelectedSort(selected);
    navigate(
      buildQueryString({
        limit,
        offset: 0,
        order_by: selected.orderBy,
        sort: selected.sort,
        tag
      })
    );
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalPost / limit);

  return {
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
    formatDate,
    SORT_OPTIONS
  };
};

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  PostFormFields,
  ErrorMessage,
  PostEditorHeader,
  LoadingSpinner
} from "../components/PostForm";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/auth/posts/${id}`);
        const post = response.data.post;
        if (post) {
          setFormData({
            title: post.title,
            description: post.description || "",
            tags: post.tags?.join(", ") || "",
            content: post.content || ""
          });
          setIsPublished(post.is_published);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch post");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id]);

  const validateForm = () => {
    if (!formData.title || formData.title.length < 3) {
      setError("Title must be at least 3 characters long");
      return false;
    }
    if (!formData.content || formData.content.length < 10) {
      setError("Content must be at least 10 characters long");
      return false;
    }
    if (!formData.tags) {
      setError("At least one tag is required");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.patch(`/auth/posts/${id}`, {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        content: formData.content
      });

      navigate("/dashboard", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post(`/auth/posts/publish/${id}`);
      setIsPublished(true);
      navigate("/dashboard", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-3xl space-y-8">
        <div className="p-8 shadow-inner bg-gradient-to-br from-[var(--color-background-primary)] to-[var(--color-shade-900)] rounded-lg">
          <PostEditorHeader
            title="Edit Post"
            subtitle="Make changes to your post below"
          />

          <ErrorMessage error={error} />

          <div className="space-y-6">
            <PostFormFields
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/dashboard"
                className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium font-mono text-center text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors shadow-inner bg-[var(--color-shade-900)]"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium font-mono bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-inner ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? <LoadingSpinner /> : "Update Post"}
              </button>

              {!isPublished && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium font-mono bg-green-600 hover:bg-green-700 text-white transition-colors shadow-inner ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? <LoadingSpinner /> : "Publish Post"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        const response = await api.get(`/posts/${id}`);
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
      await api.patch(`/posts/${id}`, {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        content: formData.content
      });

      navigate("/", { state: { success: true } });
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
      await api.post(`/posts/publish/${id}`);
      setIsPublished(true);
      navigate("/", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PostEditorHeader
          title="Edit Post"
          subtitle="Make changes to your post below"
        />

        <ErrorMessage error={error} />

        <div className="space-y-6">
          <PostFormFields
            formData={formData}
            handleChange={e => {
              const { name, value } = e.target;
              setFormData(prev => ({
                ...prev,
                [name]: value
              }));
            }}
            setFormData={setFormData}
          />

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium border border-gray-600 hover:bg-gray-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition ${
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
                className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition ${
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
  );
};

export default EditPost;

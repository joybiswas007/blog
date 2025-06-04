import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  PostFormFields,
  ErrorMessage,
  FormHeader,
  LoadingSpinner
} from "../components/PostForm";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    tags: "",
    description: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const post = response.data.post;
        if (post) {
          setFormData({
            title: post.title,
            tags: post.tags?.join(", ") || "",
            description: post.description || "",
            content: post.content || ""
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch post");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.content) {
      setError("Title, description, and content are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.patch(`/posts/${id}`, {
        title: formData.title,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        description: formData.description,
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
    if (!formData.title || !formData.description || !formData.content) {
      setError("Title, description, and content are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/posts/publish/${id}`);
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
        <FormHeader
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
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Post"
              )}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;

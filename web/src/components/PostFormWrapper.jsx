import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  PostFormFields,
  ErrorMessage,
  PostEditorHeader,
  LoadingSpinner
} from "@/components/PostForm";
import api from "@/services/api";

const PostFormWrapper = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (mode !== "edit") return;

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
        setError(err.response?.data?.error || "Failed to fetch post");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, mode]);

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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async isPublishing => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        await api.post("/auth/posts", {
          ...formData,
          tags: formData.tags.split(",").map(tag => tag.trim()),
          is_published: isPublishing
        });
      } else {
        if (isPublishing && !isPublished) {
          await api.post(`/auth/posts/publish/${id}`);
          setIsPublished(true);
        } else {
          await api.patch(`/auth/posts/${id}`, {
            ...formData,
            tags: formData.tags.split(",").map(tag => tag.trim())
          });
        }
      }

      navigate("/dashboard", { state: { success: true } });
    } catch (err) {
      const responseError = err.response?.data;
      if (responseError?.errors && Array.isArray(responseError.errors)) {
        setError(responseError.errors.map(e => Object.values(e)[0]).join(", "));
      } else if (responseError?.error) {
        setError(responseError.error);
      } else {
        setError("Failed to submit post");
      }
    } finally {
      setLoading(false);
    }
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
      <title>{mode === "edit" ? "Edit Post" : "Create Post"}</title>
      <div className="w-full max-w-3xl space-y-8">
        <PostEditorHeader
          title={mode === "edit" ? "Edit Post" : "Create New Post"}
          subtitle={
            mode === "edit"
              ? "Make changes to your post below"
              : "Fill in the details below to create a new post"
          }
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
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium font-mono text-center text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors bg-[var(--color-background-primary)] hover:bg-[var(--color-shade-900)]"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium font-mono bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">
                    {mode === "edit" ? "Updating..." : "Saving..."}
                  </span>
                </>
              ) : mode === "edit" ? (
                "Update Post"
              ) : (
                "Save Draft"
              )}
            </button>

            {(mode === "create" || !isPublished) && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium font-mono bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Publishing...</span>
                  </>
                ) : (
                  "Publish Post"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostFormWrapper;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/services/api";
import {
  PostFormFields,
  ErrorMessage,
  PostEditorHeader,
  LoadingSpinner
} from "@/components/PostForm";

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/posts", {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        content: formData.content,
        is_published: false
      });

      navigate("/dashboard", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/posts", {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        content: formData.content,
        is_published: true
      });

      navigate("/dashboard", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <title>Create Post</title>
      <div className="w-full max-w-3xl space-y-8">
        <PostEditorHeader
          title="Create New Post"
          subtitle="Fill in the details below to create a new post"
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
              onClick={handleSaveDraft}
              disabled={loading}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium font-mono bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save Draft"
              )}
            </button>

            <button
              type="button"
              onClick={handlePublish}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

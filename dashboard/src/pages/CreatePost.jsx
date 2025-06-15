import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  PostFormFields,
  ErrorMessage,
  PostEditorHeader,
  LoadingSpinner
} from "../components/PostForm";

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

  const handleSubmit = async (isPublished = true) => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/posts", {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        content: formData.content,
        is_published: isPublished
      });

      navigate("/", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
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
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium border border-gray-600 hover:bg-gray-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? <LoadingSpinner /> : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? <LoadingSpinner /> : "Publish Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

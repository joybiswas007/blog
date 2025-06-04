import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  PostFormFields,
  ErrorMessage,
  FormHeader
} from "../components/PostForm";

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    tags: "",
    description: "",
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

  const handleSubmit = async (isPublished = true) => {
    if (!formData.title || !formData.description || !formData.content) {
      setError("Title, description, and content are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/posts", {
        title: formData.title,
        tags: formData.tags.split(",").map(tag => tag.trim()),
        description: formData.description,
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
        <FormHeader
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
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
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

export default CreatePost;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MarkdownEditor from "./MarkdownEditor";
import { Link } from "react-router-dom";

export const PostEditorHeader = ({
  title,
  subtitle,
  showBackButton = true
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      {showBackButton && (
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Dashboard
        </Link>
      )}
    </div>
  </div>
);

export const PostFormFields = ({ formData, handleChange, setFormData }) => {
  const validateTitle = title => {
    if (title.length < 3) return "Title must be at least 3 characters long";
    if (title.length > 100) return "Title must be less than 100 characters";
    return null;
  };

  const validateTags = tags => {
    if (!tags) return null;
    const tagArray = tags.split(",").map(tag => tag.trim());
    if (tagArray.some(tag => tag.length > 30)) {
      return "Each tag must be less than 30 characters";
    }
    if (tagArray.length > 10) {
      return "Maximum 10 tags allowed";
    }
    return null;
  };

  const titleError = validateTitle(formData.title);
  const tagsError = validateTags(formData.tags);

  return (
    <>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-gray-700/50 border ${
            titleError ? "border-red-500" : "border-gray-600"
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors duration-200`}
          required
          maxLength={100}
          placeholder="Enter a title for your post"
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-500">{titleError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Tags <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags
            .split(",")
            .filter(Boolean)
            .map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700/50 text-gray-300"
              >
                {tag.trim()}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags
                      .split(",")
                      .filter(t => t.trim() !== tag.trim())
                      .join(",");
                    handleChange({ target: { name: "tags", value: newTags } });
                  }}
                  className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </span>
            ))}
        </div>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Add tags (comma-separated)"
          className={`w-full px-4 py-3 bg-gray-700/50 border ${
            tagsError ? "border-red-500" : "border-gray-600"
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors duration-200`}
        />
        <p className="mt-1 text-xs text-gray-400">
          Separate tags with commas (max 10 tags, 30 chars each)
        </p>
        {tagsError && <p className="mt-1 text-sm text-red-500">{tagsError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700/50">
          <MarkdownEditor
            value={formData.content}
            onChange={value =>
              setFormData(prev => ({ ...prev, content: value }))
            }
          />
        </div>
      </div>
    </>
  );
};

export function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
      {error}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
    </div>
  );
}

export default function PostForm({ post, isEditing = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    tags: post?.tags?.join(",") || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean)
      };

      if (isEditing) {
        await api.put(`/posts/${post.id}`, submitData);
      } else {
        await api.post("/posts", submitData);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PostEditorHeader
          title={isEditing ? "Edit Post" : "Create New Post"}
          subtitle={
            isEditing
              ? "Update your post content and settings"
              : "Fill in the details to create a new post"
          }
        />

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <ErrorMessage error={error} />
            <PostFormFields
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {isEditing ? "Update Post" : "Create Post"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

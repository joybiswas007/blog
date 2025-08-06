import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/services/api";
import MarkdownEditor from "./MarkdownEditor";

export const PostEditorHeader = ({
  title,
  subtitle,
  showBackButton = true
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-heading font-bold text-blue-400 mb-2">
          {title}
        </h1>
        <p className="text-[var(--color-text-secondary)] font-mono">
          {subtitle}
        </p>
      </div>
      {showBackButton && (
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 text-sm font-medium font-mono text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors duration-200"
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
            />
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
    if (title.length > 150) return "Title must be less than 150 characters";
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
    <div className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 font-mono"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--color-background-primary)] border border-[var(--color-shade-800)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors duration-200 font-mono"
          required
          maxLength={100}
          placeholder="Enter a title for your post"
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-400 font-mono">{titleError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 font-mono"
        >
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--color-background-primary)] border border-[var(--color-shade-800)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors duration-200 font-mono"
          maxLength={150}
          placeholder="Add a short description (optional)"
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 font-mono"
        >
          Tags <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags
            .split(",")
            .filter(Boolean)
            .map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600/20 text-blue-200 font-mono border border-blue-500/30"
              >
                #{tag.trim()}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags
                      .split(",")
                      .filter(t => t.trim() !== tag.trim())
                      .join(",");
                    handleChange({ target: { name: "tags", value: newTags } });
                  }}
                  className="ml-2 text-blue-200 hover:text-red-400 transition-colors"
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
                    />
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
          className="w-full px-4 py-3 bg-[var(--color-background-primary)] border border-[var(--color-shade-800)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors duration-200 font-mono"
        />
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-mono">
          Separate tags with commas (max 10 tags, 30 chars each)
        </p>
        {tagsError && (
          <p className="mt-1 text-sm text-red-400 font-mono">{tagsError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 font-mono">
          Content <span className="text-red-400">*</span>
        </label>
        <div className="rounded-lg overflow-hidden bg-[var(--color-background-primary)] border border-[var(--color-shade-800)]">
          <MarkdownEditor
            value={formData.content}
            onChange={value =>
              setFormData(prev => ({ ...prev, content: value }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 rounded-lg bg-red-500/10 text-red-400 font-mono">
      {error}
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
    </div>
  );
};

const PostForm = ({ post, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    description: post?.description || "",
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
        await api.put(`/auth/posts/${post.id}`, submitData);
      } else {
        await api.post("/auth/posts", submitData);
      }
      navigate("/dashboard");
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
    <div className="flex justify-center w-full">
      <div className="w-full max-w-3xl space-y-8">
        <PostEditorHeader
          title={isEditing ? "Edit Post" : "Create New Post"}
          subtitle={
            isEditing
              ? "Update your post content and settings"
              : "Fill in the details to create a new post"
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorMessage error={error} />
          <PostFormFields
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium font-mono text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium font-mono text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    />
                  </svg>
                  {isEditing ? "Update Post" : "Create Post"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;

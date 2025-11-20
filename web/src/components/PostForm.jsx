import { lazy, Suspense, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSave, FiX, FiClock, FiType } from "react-icons/fi";
import api from "@/services/api";
import { calculateWordCount, CalculateReadTime } from "@/utils/helpers";
const MarkdownEditor = lazy(() => import("@/components/MarkdownEditor"));
import EditorSkeleton from "@/components/EditorSkeleton";

export const PostEditorHeader = ({ title, subtitle }) => (
  <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
    <div>
      <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
        {title}
      </h1>
      <p className="text-sm mt-1 font-sans text-[var(--color-text-secondary)]">
        {subtitle}
      </p>
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
  const wordCount = calculateWordCount(formData.content);
  const readTime = CalculateReadTime(formData.content);

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="title"
            className="flex items-center text-sm font-medium font-sans text-[var(--color-text-secondary)]"
          >
            Title{" "}
            <span className="ml-1 text-[var(--color-syntax-variable)]">*</span>
          </label>
          <span
            className={`text-xs font-mono ${formData.title.length > 90 ? "text-[var(--color-syntax-variable)]" : "text-[var(--color-text-muted)]"}`}
          >
            {formData.title.length}/100
          </span>
        </div>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] placeholder:text-[var(--color-text-muted)]"
          required
          maxLength={100}
          placeholder="Enter post title..."
        />
        {titleError && (
          <p className="text-xs font-mono text-[var(--color-syntax-variable)]">
            {titleError}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="description"
            className="flex items-center text-sm font-medium font-sans text-[var(--color-text-secondary)]"
          >
            Description
          </label>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {formData.description.length}/150
          </span>
        </div>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] placeholder:text-[var(--color-text-muted)]"
          maxLength={150}
          placeholder="Brief description (optional)"
        />
      </div>

      {/* Tags Field */}
      <div className="space-y-2">
        <label
          htmlFor="tags"
          className="flex items-center text-sm font-medium font-sans text-[var(--color-text-secondary)]"
        >
          Tags{" "}
          <span className="ml-1 text-[var(--color-syntax-variable)]">*</span>
        </label>
        {formData.tags && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags
              .split(",")
              .filter(Boolean)
              .map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-mono bg-[rgba(97,175,239,0.15)] text-[var(--color-accent-primary)] border border-[rgba(97,175,239,0.3)]"
                >
                  #{tag.trim()}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags
                        .split(",")
                        .filter(t => t.trim() !== tag.trim())
                        .join(",");
                      handleChange({
                        target: { name: "tags", value: newTags }
                      });
                    }}
                    className="flex items-center justify-center w-4 h-4 rounded transition-colors bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-syntax-variable)]"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
          </div>
        )}
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="tag1, tag2, tag3"
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] placeholder:text-[var(--color-text-muted)]"
        />
        <p className="text-xs font-mono text-[var(--color-text-muted)]">
          Separate tags with commas (max 10 tags, 30 chars each)
        </p>
        {tagsError && (
          <p className="text-xs font-mono text-[var(--color-syntax-variable)]">
            {tagsError}
          </p>
        )}
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="flex items-center text-sm font-medium font-sans text-[var(--color-text-secondary)]">
            Content{" "}
            <span className="ml-1 text-[var(--color-syntax-variable)]">*</span>
          </label>
          <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <FiType className="w-3 h-3" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="w-3 h-3" />
              {readTime}
            </span>
          </div>
        </div>
        <div className="rounded overflow-hidden bg-[var(--color-input-bg)] border border-[var(--color-input-border)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] transition-all">
          <Suspense fallback={<EditorSkeleton />}>
            <MarkdownEditor
              value={formData.content}
              onChange={value =>
                setFormData(prev => ({ ...prev, content: value }))
              }
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="px-4 py-3 rounded-l-none text-sm font-mono bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[var(--color-syntax-variable)] text-[var(--color-syntax-variable)]">
      {error}
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="inline-flex">
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-current"></div>
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <PostEditorHeader
        title={isEditing ? "Edit Post" : "Create New Post"}
        subtitle={
          isEditing
            ? "Update your post content and settings"
            : "Fill in the details to create a new post"
        }
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded"
      >
        <ErrorMessage error={error} />
        <PostFormFields
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
        />

        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-t-[var(--color-panel-border)]">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans no-underline bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-active-bg)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-active-bg)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave />
                <span>{isEditing ? "Update Post" : "Create Post"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;

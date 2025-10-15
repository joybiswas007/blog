import { lazy, Suspense, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import api from "@/services/api";
const MarkdownEditor = lazy(() => import("@/components/MarkdownEditor"));
import EditorSkeleton from "@/components/EditorSkeleton";

export const PostEditorHeader = ({
  title,
  subtitle,
  showBackButton = true
}) => (
  <div className="post-editor-header">
    <div>
      <h1 className="post-editor-title">{title}</h1>
      <p className="post-editor-subtitle">{subtitle}</p>
    </div>
    {showBackButton && (
      <Link to="/dashboard" className="post-editor-back">
        <FiArrowLeft />
        <span>Dashboard</span>
      </Link>
    )}
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
    <div className="post-form-fields">
      {/* Title Field */}
      <div className="post-form-field">
        <label htmlFor="title" className="post-form-label">
          Title <span className="post-form-required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="post-form-input"
          required
          maxLength={100}
          placeholder="Enter post title..."
        />
        {titleError && <p className="post-form-error">{titleError}</p>}
      </div>

      {/* Description Field */}
      <div className="post-form-field">
        <label htmlFor="description" className="post-form-label">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="post-form-input"
          maxLength={150}
          placeholder="Brief description (optional)"
        />
      </div>

      {/* Tags Field */}
      <div className="post-form-field">
        <label htmlFor="tags" className="post-form-label">
          Tags <span className="post-form-required">*</span>
        </label>
        {formData.tags && (
          <div className="post-form-tags">
            {formData.tags
              .split(",")
              .filter(Boolean)
              .map((tag, index) => (
                <span key={index} className="post-form-tag">
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
                    className="post-form-tag-remove"
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
          className="post-form-input"
        />
        <p className="post-form-hint">
          Separate tags with commas (max 10 tags, 30 chars each)
        </p>
        {tagsError && <p className="post-form-error">{tagsError}</p>}
      </div>

      {/* Content Field */}
      <div className="post-form-field">
        <label className="post-form-label">
          Content <span className="post-form-required">*</span>
        </label>
        <div className="post-form-editor">
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
  return <div className="post-form-error-box">{error}</div>;
};

export const LoadingSpinner = () => {
  return (
    <div className="inline-flex">
      <div className="post-form-spinner"></div>
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
    <div className="post-form-container">
      <PostEditorHeader
        title={isEditing ? "Edit Post" : "Create New Post"}
        subtitle={
          isEditing
            ? "Update your post content and settings"
            : "Fill in the details to create a new post"
        }
      />

      <form onSubmit={handleSubmit} className="post-form">
        <ErrorMessage error={error} />
        <PostFormFields
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
        />

        <div className="post-form-actions">
          <Link to="/dashboard" className="post-form-cancel">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="post-form-submit">
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

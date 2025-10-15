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
  <div className="flex items-center justify-between p-4 bg-[#21252b] border border-[#2c313a] rounded">
    <div>
      <h1 className="text-2xl font-bold font-sans text-[#abb2bf]">{title}</h1>
      <p className="text-sm mt-1 font-sans text-[#5c6370]">{subtitle}</p>
    </div>
    {showBackButton && (
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
      >
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
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="flex items-center text-sm font-medium font-sans text-[#5c6370]"
        >
          Title <span className="ml-1 text-[#e06c75]">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
          required
          maxLength={100}
          placeholder="Enter post title..."
        />
        {titleError && (
          <p className="text-xs font-mono text-[#e06c75]">{titleError}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="flex items-center text-sm font-medium font-sans text-[#5c6370]"
        >
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
          maxLength={150}
          placeholder="Brief description (optional)"
        />
      </div>

      {/* Tags Field */}
      <div className="space-y-2">
        <label
          htmlFor="tags"
          className="flex items-center text-sm font-medium font-sans text-[#5c6370]"
        >
          Tags <span className="ml-1 text-[#e06c75]">*</span>
        </label>
        {formData.tags && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags
              .split(",")
              .filter(Boolean)
              .map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-mono bg-[rgba(97,175,239,0.15)] text-[#61afef] border border-[rgba(97,175,239,0.3)]"
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
                    className="flex items-center justify-center w-4 h-4 rounded transition-colors bg-transparent text-[#5c6370] hover:text-[#e06c75]"
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
          className="w-full px-4 py-3 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
        />
        <p className="text-xs font-mono text-[#4b5263]">
          Separate tags with commas (max 10 tags, 30 chars each)
        </p>
        {tagsError && (
          <p className="text-xs font-mono text-[#e06c75]">{tagsError}</p>
        )}
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium font-sans text-[#5c6370]">
          Content <span className="ml-1 text-[#e06c75]">*</span>
        </label>
        <div className="rounded overflow-hidden bg-[#1e2127] border border-[#3e4451]">
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
    <div className="px-4 py-3 rounded-l-none text-sm font-mono bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[#e06c75] text-[#e06c75]">
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
        className="space-y-6 p-6 bg-[#21252b] border border-[#2c313a] rounded"
      >
        <ErrorMessage error={error} />
        <PostFormFields
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
        />

        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-t-[#2c313a]">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans no-underline bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-50 disabled:cursor-not-allowed"
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

import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import {
  PostFormFields,
  ErrorMessage,
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

      navigate("/", { state: { success: true } });
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
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner />
        <p className="mt-3 text-sm font-mono text-[#5c6370]">Loading post...</p>
      </div>
    );
  }

  return (
    <>
      <title>{mode === "edit" ? "Edit Post" : "Create Post"}</title>
      <div className="w-full max-w-4xl mx-auto">
        <div className="space-y-6 p-6 bg-[#21252b] border border-[#2c313a] rounded">
          <div>
            <h1 className="text-2xl font-bold font-sans text-[#abb2bf]">
              {mode === "edit" ? "Edit Post" : "Create New Post"}
            </h1>
            <p className="text-sm mt-1 font-sans text-[#5c6370]">
              {mode === "edit"
                ? "Make changes to your post below"
                : "Fill in the details below to create a new post"}
            </p>
          </div>

          <ErrorMessage error={error} />

          <PostFormFields
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-t-[#2c313a]">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans no-underline bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>{mode === "edit" ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <span>{mode === "edit" ? "Update Post" : "Save Draft"}</span>
              )}
            </button>

            {(mode === "create" || !isPublished) && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(97,175,239,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostFormWrapper;

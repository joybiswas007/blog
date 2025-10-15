import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FiSend } from "react-icons/fi";
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
      <div className="post-form-loading">
        <LoadingSpinner />
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <>
      <title>{mode === "edit" ? "Edit Post" : "Create Post"}</title>
      <div className="post-form-container">
        <PostEditorHeader
          title={mode === "edit" ? "Edit Post" : "Create New Post"}
          subtitle={
            mode === "edit"
              ? "Make changes to your post below"
              : "Fill in the details below to create a new post"
          }
        />

        <div className="post-form">
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

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="post-form-draft"
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
                className="post-form-publish"
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

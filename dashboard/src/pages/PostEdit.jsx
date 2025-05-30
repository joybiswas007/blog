import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import MarkdownEditor from "../components/MarkdownEditor";
import { postService } from "../services/api";
import { toast } from "react-hot-toast";

const PostEdit = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(id);
        const post = data.post;
        if (post) {
          setTitle(post.title);
          setTags(post.tags?.join(", ") || "");
          setDescription(post.description || "");
          setContent(post.content || "");
        } else {
          toast.error("Post not found");
          navigate("/posts");
        }
      } catch (error) {
        toast.error("Failed to fetch post");
        navigate("/posts");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postService.updatePost(id, {
        title,
        tags: tags.split(",").map((tag) => tag.trim()),
        description,
        content,
      });
      toast.success("Post updated successfully");
      navigate("/posts");
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              className="input-field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Content
            </label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/posts")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostEdit;

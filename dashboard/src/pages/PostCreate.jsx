import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import MarkdownEditor from "../components/MarkdownEditor";
import { postService } from "../services/api";
import { toast } from "react-hot-toast";

const PostCreate = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postService.createPost({
        title,
        tags: tags.split(",").map((tag) => tag.trim()),
        description,
        content,
      });
      toast.success("Post created successfully");
      navigate("/posts");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Create Post</h1>
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
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostCreate;

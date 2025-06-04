import MarkdownEditor from "./MarkdownEditor";

export const PostFormFields = ({ formData, handleChange, setFormData }) => {
  return (
    <>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="react, javascript, webdev"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
        <p className="mt-1 text-xs text-gray-400">Separate tags with commas</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Content <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-600 rounded-lg overflow-hidden">
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

export const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
);

export const ErrorMessage = ({ error }) =>
  error && (
    <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
      {error}
    </div>
  );

export const FormHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-emerald-400 mb-2">{title}</h1>
    <p className="text-gray-400">{subtitle}</p>
  </div>
);

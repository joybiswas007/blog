import { Link } from "react-router-dom";

const Tools = () => {
  const tools = [
    { name: "Sessions", path: "/auth/tools/sessions" },
    { name: "IP Ban", path: "/auth/tools/ip-ban" },
    { name: "Logs", path: "/auth/tools/logs" },
    { name: "Backups", path: "/auth/tools/backups" },
    { name: "Settings", path: "/auth/tools/settings" }
  ];

  return (
    <div className="flex justify-center w-full min-h-screen bg-[var(--color-background-primary)]">
      <div className="w-full max-w-3xl px-4 py-6">
        {/* Header with Dashboard Link */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-blue-300 font-heading">Toolbox</h1>
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
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.path}
              className="group block p-6 bg-blue-900/20 border border-blue-800 rounded-lg hover:bg-blue-900/30 hover:border-blue-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-400 group-hover:text-blue-300 font-heading text-lg transition-colors">
                  {tool.name}
                </span>
                <span className="text-blue-600 group-hover:text-blue-400 text-xl transition-colors">
                  →
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)] text-sm mt-2 font-mono">
                Manage {tool.name.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;

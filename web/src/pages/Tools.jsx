import { Link } from "react-router-dom";

const Tools = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const pageTitle = `Tools :: ${blogName}`;

  const tools = [
    {
      name: "Sessions",
      path: "/auth/tools/sessions",
      desc: "View and manage session history."
    },
    {
      name: "IP Ban",
      path: "/auth/tools/ip-bans",
      desc: "Ban IPs or view banned IPs."
    }
  ];

  return (
    <div className="flex justify-center w-full">
      <title>{pageTitle}</title>
      <div className="w-full max-w-3xl px-4 py-4 space-y-8">
        {/* Header with Dashboard Link */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading text-blue-300">Toolbox</h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-mono font-medium text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors duration-200"
          >
            <span className="text-blue-500 mr-2 text-lg">←</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Tools Section Label */}
        <div className="mb-2">
          <h2 className="text-lg font-heading text-blue-400">
            Available Tools
          </h2>
          <p className="text-sm font-mono text-[var(--color-text-secondary)]">
            Quick access to admin & maintenance features
          </p>
        </div>

        {/* Redesigned Tools List (vertical, with left accent bar) */}
        <ul className="space-y-2">
          {tools.map((tool, i) => (
            <li key={i}>
              <Link
                to={tool.path}
                className="flex items-center group px-0 py-0 rounded-lg border-l-4 border-blue-900 hover:border-blue-400 bg-[var(--color-background-primary)] hover:bg-blue-900/10 transition-colors"
              >
                <div className="flex-1 px-4 py-3">
                  <span className="font-heading text-blue-400 group-hover:text-blue-300 text-lg transition-colors block">
                    {tool.name}
                  </span>
                  <span className="text-[var(--color-text-secondary)] font-mono text-xs group-hover:text-blue-400 transition-colors block mt-1">
                    {tool.desc}
                  </span>
                </div>
                <span className="text-blue-600 group-hover:text-blue-400 text-xl transition-colors px-4 font-mono">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tools;

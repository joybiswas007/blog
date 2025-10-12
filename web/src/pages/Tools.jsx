import { Link } from "react-router-dom";
import { FiUsers, FiSlash, FiShield } from "react-icons/fi";

const Tools = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const pageTitle = `Tools :: ${blogName}`;

  const tools = [
    {
      name: "Sessions",
      path: "/auth/tools/sessions",
      desc: "View and manage session history.",
      icon: <FiUsers className="w-8 h-8 text-blue-400" />,
    },
    {
      name: "IP Ban",
      path: "/auth/tools/ip-bans",
      desc: "Ban IPs or view banned IPs.",
      icon: <FiSlash className="w-8 h-8 text-blue-400" />,
    },
    {
      name: "Login Attempts",
      path: "/auth/tools/login-attempts",
      desc: "View recent login attempts",
      icon: <FiShield className="w-8 h-8 text-blue-400" />,
    },
  ];

  return (
    <div className="flex justify-center w-full">
      <title>{pageTitle}</title>
      <div className="w-full max-w-3xl px-4 py-4 space-y-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.path}
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 flex flex-col items-center text-center hover:border-blue-700 hover:bg-neutral-800/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-4">{tool.icon}</div>
              <h3 className="font-heading text-lg text-blue-300 mb-2">
                {tool.name}
              </h3>
              <p className="text-sm font-mono text-neutral-400">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;

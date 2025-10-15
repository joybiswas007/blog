import { Link } from "react-router-dom";
import { FiUsers, FiSlash, FiShield, FiArrowLeft } from "react-icons/fi";

const Tools = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const pageTitle = `Tools :: ${blogName}`;

  const tools = [
    {
      name: "Sessions",
      path: "/auth/tools/sessions",
      desc: "View and manage active user sessions",
      icon: <FiUsers />
    },
    {
      name: "IP Bans",
      path: "/auth/tools/ip-bans",
      desc: "Manage IP address restrictions",
      icon: <FiSlash />
    },
    {
      name: "Login Attempts",
      path: "/auth/tools/login-attempts",
      desc: "Monitor authentication activity",
      icon: <FiShield />
    }
  ];

  return (
    <>
      <title>{pageTitle}</title>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
          <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
            Toolbox
          </h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
          >
            <FiArrowLeft />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.path}
              className="group flex flex-col p-5 rounded no-underline transition-all bg-[var(--color-hover-bg)] border border-[var(--color-panel-border)] border-l-3 border-l-transparent min-h-[140px] hover:bg-[var(--color-active-bg)] hover:border-l-[var(--color-accent-primary)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded mb-4 bg-[var(--color-active-bg)] text-[var(--color-accent-primary)] text-2xl shrink-0 transition-colors group-hover:bg-[var(--color-accent-primary)] group-hover:text-white">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-2 font-sans text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-primary)]">
                  {tool.name}
                </h3>
                <p className="text-sm leading-relaxed font-sans text-[var(--color-text-secondary)]">
                  {tool.desc}
                </p>
              </div>
              <div className="text-xl font-bold mt-3 self-end text-[var(--color-text-muted)] transition-all group-hover:text-[var(--color-accent-primary)] group-hover:translate-x-1">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;

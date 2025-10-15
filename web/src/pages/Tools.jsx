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
      <div className="tools-container">
        <div className="tools-header">
          <h1 className="tools-title">Toolbox</h1>
          <Link to="/dashboard" className="tools-back-btn">
            <FiArrowLeft />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="tools-grid">
          {tools.map((tool, i) => (
            <Link key={i} to={tool.path} className="tool-card">
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-content">
                <h3 className="tool-name">{tool.name}</h3>
                <p className="tool-desc">{tool.desc}</p>
              </div>
              <div className="tool-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;

import { Link, useLocation } from "react-router-dom";
import { BsFolder2Open, BsFileText, BsTag } from "react-icons/bs";

const NAV_ITEMS = [
  { label: "Posts", to: "/", icon: <BsFileText /> },
  { label: "Archives", to: "/archives", icon: <BsFolder2Open /> },
  { label: "Tags", to: "/tags", icon: <BsTag /> }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="explorer-title">EXPLORER</span>
      </div>

      <nav className="file-tree" aria-label="Main navigation">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`file-item ${isActive ? "active" : ""}`}
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="file-icon">{item.icon}</span>
              <span className="file-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

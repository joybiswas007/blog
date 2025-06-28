import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Archives", to: "/archives" },
  { label: "Tags", to: "/tags" },
  { label: "About", to: "/about" }
];

const Navigation = () => (
  <nav className="flex gap-6 text-base font-mono" aria-label="Main navigation">
    {NAV_LINKS.map(item => (
      <Link
        key={item.to}
        to={item.to}
        className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
        tabIndex={0}
        aria-label={`Navigate to ${item.label}`}
      >
        {item.label}
      </Link>
    ))}
  </nav>
);

export default Navigation;

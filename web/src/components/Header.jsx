import { Link } from "react-router-dom";
import { BsSun, BsMoon } from "react-icons/bs";
import { useTheme } from "@/contexts/ThemeContext";

const Header = ({ blogName }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="title-bar">
      <div className="title-bar-center">
        <Link to="/" className="title-link" aria-label="Go to homepage">
          {blogName}
        </Link>
      </div>

      <div className="title-bar-right">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          type="button"
        >
          {theme === "dark" ? <BsSun /> : <BsMoon />}
        </button>
      </div>
    </header>
  );
};

export default Header;

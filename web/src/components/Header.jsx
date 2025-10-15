import { Link } from "react-router-dom";

const Header = ({ blogName }) => {
  return (
    <header className="title-bar">
      <div className="title-bar-center">
        <Link to="/" className="title-link" aria-label="Go to homepage">
          {blogName}
        </Link>
      </div>

      <div className="title-bar-right">
        {/* Optional: Add theme toggle button here */}
      </div>
    </header>
  );
};

export default Header;

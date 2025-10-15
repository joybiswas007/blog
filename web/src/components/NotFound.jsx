import { Link } from "react-router-dom";
import {
  BsHouseDoor,
  BsArrowLeft,
  BsExclamationTriangle
} from "react-icons/bs";
import SEO from "./SEO";

const NotFound = () => {
  return (
    <>
      <SEO title="404 - Page Not Found" />
      <div className="notfound-container">
        <div className="notfound-content">
          {/* Error Icon */}
          <div className="notfound-icon">
            <BsExclamationTriangle />
          </div>

          {/* 404 Code */}
          <div className="notfound-code">404</div>

          {/* Error Message */}
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-description">
            The file you're looking for doesn't exist in this directory. It may
            have been moved, deleted, or the path is incorrect.
          </p>

          {/* Action Buttons */}
          <div className="notfound-actions">
            <Link to="/" className="notfound-button primary">
              <BsHouseDoor className="notfound-button-icon" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="notfound-button secondary"
              aria-label="Go back to previous page"
              type="button"
            >
              <BsArrowLeft className="notfound-button-icon" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Error Details (IDE-style) */}
          <div className="notfound-details">
            <div className="notfound-detail-item">
              <span className="notfound-detail-label">Error Code:</span>
              <span className="notfound-detail-value">HTTP 404</span>
            </div>
            <div className="notfound-detail-item">
              <span className="notfound-detail-label">Location:</span>
              <span className="notfound-detail-value">
                {window.location.pathname}
              </span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="notfound-footer">
            <p>💡 Tip: Check the URL for typos or use the navigation menu</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

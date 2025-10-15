import { Link } from "react-router-dom";
import {
  FiGithub,
  FiLinkedin,
  FiMail,
  FiGitBranch,
  FiGitCommit,
  FiCode
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { useEffect, useState } from "react";
import api from "@/services/api";

const StatusBar = ({ authorName, sourceCode }) => {
  const [buildInfo, setBuildInfo] = useState({});
  const [goVersion, setGoVersion] = useState("");

  const fetchBuildInfo = async () => {
    try {
      const response = await api.get("/build-info");
      setBuildInfo(response.data.build_info);
      setGoVersion(response.data.go_version);
    } catch {
      setBuildInfo({ branch: "main", commit: "unknown" });
      setGoVersion("Go");
    }
  };

  useEffect(() => {
    fetchBuildInfo();
  }, []);

  const {
    VITE_AUTHOR_EMAIL,
    VITE_AUTHOR_GITHUB,
    VITE_AUTHOR_LINKEDIN,
    VITE_AUTHOR_TWITTER
  } = import.meta.env;

  const socialLinks = [
    { url: VITE_AUTHOR_GITHUB, icon: <FiGithub />, label: "GitHub" },
    { url: VITE_AUTHOR_LINKEDIN, icon: <FiLinkedin />, label: "LinkedIn" },
    { url: VITE_AUTHOR_TWITTER, icon: <FaXTwitter />, label: "Twitter" },
    { url: VITE_AUTHOR_EMAIL, icon: <FiMail />, type: "email", label: "Email" }
  ];

  const getLink = social => {
    if (social.type === "email") {
      return `mailto:${social.url}`;
    }
    return social.url;
  };

  const shortCommit = buildInfo?.commit?.substring(0, 7) || "unknown";

  const getCommitUrl = commitHash => {
    if (!commitHash || commitHash === "unknown" || !sourceCode) return null;
    return `${sourceCode}/commit/${commitHash}`;
  };

  const isExternalLink = url => {
    return (
      url &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("mailto:"))
    );
  };

  return (
    <footer className="status-bar">
      <div className="status-left">
        {buildInfo && buildInfo.branch && (
          <>
            <span className="status-item">
              <FiGitBranch className="status-icon" />
              <span className="status-value">{buildInfo.branch}</span>
            </span>
            <span className="status-separator">·</span>
            <span className="status-item">
              <FiGitCommit className="status-icon" />
              {getCommitUrl(buildInfo.commit) ? (
                <Link
                  to={getCommitUrl(buildInfo.commit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="status-link"
                  aria-label="View commit on GitHub"
                >
                  {shortCommit}
                </Link>
              ) : (
                <span className="status-value">{shortCommit}</span>
              )}
            </span>
            <span className="status-separator">·</span>
            <span className="status-item">
              <FiCode className="status-icon" />
              <span className="status-value">{goVersion}</span>
            </span>
          </>
        )}
      </div>

      <div className="status-right">
        <span className="status-copyright">
          © {new Date().getFullYear()} {authorName}
        </span>
        <span className="status-separator">·</span>
        <div className="social-links">
          {socialLinks.map(
            (social, index) =>
              social.url &&
              (isExternalLink(getLink(social)) ? (
                <Link
                  key={index}
                  to={getLink(social)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </Link>
              ) : (
                <Link
                  key={index}
                  to={getLink(social)}
                  className="social-icon"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </Link>
              ))
          )}
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;

import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
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
    } catch (err) {
      console.error("Failed to fetch build info:", err);
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

  const shortCommit = buildInfo?.commit?.substring(0, 7) || "";

  const getCommitUrl = commitHash => {
    if (!commitHash || !sourceCode) return null;
    return `${sourceCode}/commit/${commitHash}`;
  };

  return (
    <footer className="status-bar">
      <div className="status-left">
        {buildInfo && (
          <>
            <span className="status-item">
              Branch: <span className="status-value">{buildInfo.branch}</span>
            </span>
            <span className="status-separator">|</span>
            <span className="status-item">
              {getCommitUrl(buildInfo.commit) ? (
                <Link
                  to={getCommitUrl(buildInfo.commit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="status-link"
                  aria-label="View commit on GitHub"
                >
                  #{shortCommit}
                </Link>
              ) : (
                <>#{shortCommit}</>
              )}
            </span>
            <span className="status-separator">|</span>
            <span className="status-item">{goVersion}</span>
          </>
        )}
      </div>

      <div className="status-right">
        <div className="social-links">
          {socialLinks.map(
            (social, index) =>
              social.url && (
                <Link
                  key={index}
                  to={getLink(social)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              )
          )}
        </div>
        <span className="status-separator">|</span>
        <span className="status-item">
          © {new Date().getFullYear()} {authorName}
        </span>
      </div>
    </footer>
  );
};

export default StatusBar;

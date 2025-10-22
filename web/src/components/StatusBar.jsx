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
    <footer className="flex items-center justify-between px-0 py-0 bg-[#21252b] text-white font-sans text-[11px] min-h-6 shrink-0 overflow-x-auto scrollbar-hide">
      {/* Left Section - Git Info */}
      <div className="flex items-center h-6 shrink-0">
        {buildInfo && buildInfo.branch && (
          <>
            {/* Branch */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[#98c379] text-[#21252b]">
              <FiGitBranch className="shrink-0 w-3 h-3" />
              <span className="font-semibold whitespace-nowrap hidden sm:inline">
                {buildInfo.branch}
              </span>
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[#98c379]"></div>

            {/* Commit */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[#2c313a]">
              <FiGitCommit className="shrink-0 w-3 h-3 text-[#61afef]" />
              {getCommitUrl(buildInfo.commit) ? (
                <Link
                  to={getCommitUrl(buildInfo.commit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline font-medium font-mono text-[#abb2bf] transition-colors hover:text-[#61afef] whitespace-nowrap"
                  aria-label="View commit on GitHub"
                >
                  {shortCommit}
                </Link>
              ) : (
                <span className="font-medium font-mono text-[#abb2bf] whitespace-nowrap">
                  {shortCommit}
                </span>
              )}
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[#2c313a]"></div>

            {/* Language */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[#353b45]">
              <FiCode className="shrink-0 w-3 h-3 text-[#e5c07b]" />
              <span className="font-medium text-[#abb2bf] whitespace-nowrap">
                {goVersion}
              </span>
            </div>

            {/* End separator */}
            <div className="hidden sm:block w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[#353b45]"></div>
          </>
        )}
      </div>

      {/* Right Section - Author & Social */}
      <div className="flex items-center h-6 shrink-0 ml-auto">
        {/* Social Links */}
        <div className="flex items-center gap-0 px-2 md:px-3 h-full bg-[#353b45]">
          {socialLinks.map(
            (social, index) =>
              social.url &&
              (isExternalLink(getLink(social)) ? (
                <Link
                  key={index}
                  to={getLink(social)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-5 md:w-6 h-6 rounded transition-colors no-underline text-[#5c6370] hover:text-[#61afef]"
                  aria-label={social.label}
                  title={social.label}
                >
                  <span className="w-3 h-3">{social.icon}</span>
                </Link>
              ) : (
                <Link
                  key={index}
                  to={getLink(social)}
                  className="flex items-center justify-center w-5 md:w-6 h-6 rounded transition-colors no-underline text-[#5c6370] hover:text-[#61afef]"
                  aria-label={social.label}
                  title={social.label}
                >
                  <span className="w-3 h-3">{social.icon}</span>
                </Link>
              ))
          )}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[#353b45]"></div>

        {/* Copyright */}
        <div className="flex items-center px-2 md:px-3 h-full bg-[#61afef] text-[#21252b]">
          <span className="font-semibold whitespace-nowrap text-[10px] md:text-[11px]">
            © {new Date().getFullYear()}{" "}
            <span className="hidden sm:inline">{authorName}</span>
            <span className="sm:hidden">{authorName.split(" ")[0]}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;

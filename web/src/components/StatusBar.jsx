import { Link } from "react-router-dom";
import { FiGitBranch, FiGitCommit, FiCode, FiClock } from "react-icons/fi";
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
      setBuildInfo({ branch: "main", commit: "unknown", time: null });
      setGoVersion("Go");
    }
  };

  useEffect(() => {
    fetchBuildInfo();
  }, []);

  const shortCommit = buildInfo?.commit?.substring(0, 7) || "unknown";

  const getCommitUrl = commitHash => {
    if (!commitHash || commitHash === "unknown" || !sourceCode) return null;
    return `${sourceCode}/commit/${commitHash}`;
  };

  const formatBuildTime = timestamp => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    // Format: "Nov 15, 2025" or customize as needed
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const buildTime = formatBuildTime(buildInfo?.time);

  return (
    <footer className="flex items-center justify-between px-0 py-0 bg-[var(--color-sidebar-bg)] text-white font-sans text-[11px] min-h-6 shrink-0 overflow-x-auto scrollbar-hide">
      {/* Left Section - Git Info */}
      <div className="flex items-center h-6 shrink-0">
        {buildInfo && buildInfo.branch && (
          <>
            {/* Branch */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[var(--color-syntax-string)] text-[var(--color-sidebar-bg)]">
              <FiGitBranch className="shrink-0 w-3 h-3" />
              <span className="font-semibold whitespace-nowrap">
                {buildInfo.branch}
              </span>
            </div>

            {/* Separator */}
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[var(--color-syntax-string)]"></div>

            {/* Commit */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[var(--color-hover-bg)]">
              <FiGitCommit className="shrink-0 w-3 h-3 text-[var(--color-accent-primary)]" />
              {getCommitUrl(buildInfo.commit) ? (
                <Link
                  to={getCommitUrl(buildInfo.commit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline font-medium font-mono text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent-primary)] whitespace-nowrap"
                  aria-label="View commit on GitHub"
                >
                  {shortCommit}
                </Link>
              ) : (
                <span className="font-medium font-mono text-[var(--color-text-primary)] whitespace-nowrap">
                  {shortCommit}
                </span>
              )}
            </div>

            {/* Separator */}
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[var(--color-hover-bg)]"></div>

            {/* Language */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[var(--color-active-bg)]">
              <FiCode className="shrink-0 w-3 h-3 text-[var(--color-syntax-constant)]" />
              <span className="font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                {goVersion}
              </span>
            </div>

            {/* Separator */}
            {buildTime && (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[var(--color-active-bg)]"></div>
            )}

            {/* Build Time */}
            {buildTime && (
              <>
                <div className="flex items-center gap-1.5 px-2 md:px-3 h-full bg-[var(--color-editor-bg)]">
                  <FiClock className="shrink-0 w-3 h-3 text-[var(--color-syntax-keyword)]" />
                  <span
                    className="font-medium text-[var(--color-text-primary)] whitespace-nowrap"
                    title={`Built on ${buildTime}`}
                  >
                    <span className="hidden sm:inline">Built on </span>
                    {buildTime}
                  </span>
                </div>

                {/* End separator */}
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[8px] border-l-[var(--color-editor-bg)]"></div>
              </>
            )}
          </>
        )}
      </div>

      {/* Right Section - Copyright */}
      <div className="flex items-center h-6 shrink-0 ml-auto">
        <div className="flex items-center px-2 md:px-3 h-full bg-[var(--color-accent-primary)] text-[var(--color-sidebar-bg)]">
          <span className="font-semibold whitespace-nowrap text-[10px] md:text-[11px]">
            &copy; {new Date().getFullYear()} {authorName}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;

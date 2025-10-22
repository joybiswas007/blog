import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BsFolder2Open,
  BsFileText,
  BsTag,
  BsChevronRight,
  BsList,
  BsX
} from "react-icons/bs";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const NAV_ITEMS = [
  { label: "Posts", to: "/", icon: <BsFileText /> },
  { label: "Archives", to: "/archives", icon: <BsFolder2Open /> },
  { label: "Tags", to: "/tags", icon: <BsTag /> }
];

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  ].filter(link => link.url);

  const getLink = social => {
    if (social.type === "email") {
      return `mailto:${social.url}`;
    }
    return social.url;
  };

  const isExternalLink = url => {
    return (
      url &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("mailto:"))
    );
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const SidebarContent = () => (
    <>
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#282c34]">
        <div className="flex items-center gap-2">
          <BsChevronRight className="w-3 h-3 text-[#5c6370]" />
          <span className="text-[10px] font-bold tracking-widest uppercase font-sans text-[#5c6370]">
            Netrw
          </span>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#5c6370] hover:text-[#abb2bf] transition-colors"
            aria-label="Close menu"
          >
            <BsX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Tree */}
      <nav className="flex flex-col py-1" aria-label="Main navigation">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-2 px-3 py-1.5 no-underline font-sans text-[13px] transition-all duration-150 border-l-2 ${
                isActive
                  ? "bg-[#2c313a] border-l-[#61afef] text-[#61afef]"
                  : "border-l-transparent text-[#abb2bf] hover:bg-[#2c313a] hover:border-l-[#5c6370]"
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="w-3 flex items-center justify-center">
                {isActive ? (
                  <span className="w-1 h-1 rounded-full bg-[#61afef]"></span>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </span>

              <span
                className={`flex items-center transition-colors ${
                  isActive
                    ? "text-[#61afef]"
                    : "text-[#5c6370] group-hover:text-[#abb2bf]"
                }`}
              >
                {item.icon}
              </span>

              <span className="flex-1">{item.label}</span>

              {isActive && (
                <span className="text-[10px] font-mono text-[#5c6370]">●</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section with Social Icons */}
      <div className="mt-auto">
        {/* Social Icons */}
        {socialLinks.length > 0 && (
          <div className="px-3 py-3">
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) =>
                isExternalLink(getLink(social)) ? (
                  <Link
                    key={index}
                    to={getLink(social)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded transition-colors no-underline text-[#5c6370] hover:text-[#61afef] hover:bg-[#2c313a]"
                    aria-label={social.label}
                    title={social.label}
                  >
                    <span className="w-4 h-4">{social.icon}</span>
                  </Link>
                ) : (
                  <Link
                    key={index}
                    to={getLink(social)}
                    className="flex items-center justify-center w-8 h-8 rounded transition-colors no-underline text-[#5c6370] hover:text-[#61afef] hover:bg-[#2c313a]"
                    aria-label={social.label}
                    title={social.label}
                  >
                    <span className="w-4 h-4">{social.icon}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-0 left-0 z-50 w-12 h-8 flex items-center justify-center bg-[#21252b] text-[#abb2bf] hover:bg-[#282c34] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <BsList className="w-5 h-5" />
        </button>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex flex-col bg-[#21252b] overflow-y-auto shrink-0
          ${
            isMobile
              ? `fixed top-0 left-0 h-full w-60 z-50 transition-transform duration-300 ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "w-60"
          }
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;

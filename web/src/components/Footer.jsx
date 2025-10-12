import { Link } from "react-router-dom";
import { BsFolder } from "react-icons/bs";
import { SiGo } from "react-icons/si";
import { FaReact } from "react-icons/fa";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const Footer = ({ authorName, sourceCode }) => {
  const {
    VITE_AUTHOR_EMAIL,
    VITE_AUTHOR_GITHUB,
    VITE_AUTHOR_LINKEDIN,
    VITE_AUTHOR_TWITTER
  } = import.meta.env;

  const socialLinks = [
    { url: VITE_AUTHOR_GITHUB, icon: <FiGithub /> },
    { url: VITE_AUTHOR_LINKEDIN, icon: <FiLinkedin /> },
    { url: VITE_AUTHOR_TWITTER, icon: <FaXTwitter /> },
    { url: VITE_AUTHOR_EMAIL, icon: <FiMail />, type: "email" }
  ];

  const getLink = social => {
    if (social.type === "email") {
      return `mailto:${social.url}`;
    }
    return social.url;
  };

  return (
    <footer className="w-full py-6 mt-8 bg-transparent">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 text-sm text-[var(--color-text-primary)] font-mono gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <span>
            &copy; {new Date().getFullYear()} {authorName}
          </span>
          {sourceCode && (
            <Link
              to={sourceCode}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              tabIndex={0}
              aria-label="View source code on external site"
            >
              <BsFolder className="text-blue-500 mr-1" />
              Source
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {socialLinks.map(
            (social, index) =>
              social.url && (
                <Link
                  key={index}
                  to={getLink(social)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-blue-400 transition-colors"
                >
                  {social.icon}
                </Link>
              )
          )}
        </div>
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <span>Powered by</span>
          <SiGo size={24} className="text-blue-400" />
          <span>+</span>
          <FaReact size={20} className="text-blue-400" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { Link } from "react-router-dom";
import {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiExternalLink
} from "react-icons/fi";

import { TbBrandUpwork, TbBrandFiverr } from "react-icons/tb";
import { StripSchema } from "../utils/helpers";
import Title from "../components/Title";

const About = () => {
  const { VITE_BLOG_NAME } = import.meta.env;
  // Read from environment variables
  const author = {
    name: import.meta.env.VITE_AUTHOR_NAME || "Your Name",
    profession: import.meta.env.VITE_AUTHOR_PROFESSION || "Developer",
    email: import.meta.env.VITE_AUTHOR_EMAIL || "your.email@example.com",
    github: import.meta.env.VITE_AUTHOR_GITHUB || "",
    linkedin: import.meta.env.VITE_AUTHOR_LINKEDIN || "",
    twitter: import.meta.env.VITE_AUTHOR_TWITTER || "",
    fiverr: import.meta.env.VITE_AUTHOR_FIVERR || "",
    upwork: import.meta.env.VITE_AUTHOR_UPWORK || ""
  };

  const getSocialIcon = url => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("github")) return <FiGithub className="w-5 h-5" />;
    if (lowerUrl.includes("linkedin"))
      return <FiLinkedin className="w-5 h-5" />;
    if (lowerUrl.includes("twitter")) return <FiTwitter className="w-5 h-5" />;
    if (lowerUrl.includes("fiverr"))
      return <TbBrandFiverr className="w-5 h-5" />;
    if (lowerUrl.includes("upwork"))
      return <TbBrandUpwork className="w-5 h-5" />;
    return <FiExternalLink className="w-5 h-5" />;
  };

  const SocialLink = ({ url }) => {
    if (!url) return null;

    return (
      <Link
        to={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 font-mono text-blue-400 hover:text-blue-300 transition-colors group"
      >
        <span className="text-blue-500 group-hover:text-blue-300 transition-colors">
          {getSocialIcon(url)}
        </span>
        <span>{StripSchema(url)}</span>
      </Link>
    );
  };

  return (
    <div className="flex justify-center w-full">
      <Title title={VITE_BLOG_NAME} />
      <div className="space-y-12 w-full max-w-3xl px-4">
        {/* Author Section */}
        <section>
          <p className="text-2xl font-heading text-blue-300 flex items-center gap-2">
            <span>{author.name}</span>
            <span className="text-blue-500 text-xl">-</span>
            <span className="text-blue-400 text-base">{author.profession}</span>
          </p>
        </section>

        {/* Greeting Section */}
        <section>
          <h2 className="text-lg font-heading text-blue-300 mb-2">Greeting</h2>
          <div>
            <p className="text-[var(--color-text-primary)] mb-1">
              If you want to talk about technology, collaborate on a project, or
              just say hello,
            </p>
            <p className="text-[var(--color-text-primary)]">
              I'd love to hear from you! Feel free to reach out through any of
              these channels:
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-lg font-heading text-blue-300 mb-2">Contact</h2>
          <Link
            to={`mailto:${author.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-mono text-blue-400 hover:text-blue-300 transition-colors group"
          >
            <span className="text-blue-500 group-hover:text-blue-300 transition-colors">
              <FiMail className="w-5 h-5" />
            </span>
            <span>{author.email}</span>
          </Link>
        </section>

        {/* Social Section */}
        <section>
          <h2 className="text-lg font-heading text-blue-300 mb-2">Social</h2>
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
            <SocialLink url={author.github} label="GitHub" />
            <SocialLink url={author.linkedin} label="LinkedIn" />
            <SocialLink url={author.twitter} label="Twitter" />
            <SocialLink url={author.fiverr} label="Fiverr" />
            <SocialLink url={author.upwork} label="Upwork" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

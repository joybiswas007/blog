import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail, FiExternalLink } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandUpwork, TbBrandFiverr } from "react-icons/tb";
import { StripSchema } from "@/utils/helpers";
import SEO from "@/components/SEO";

const About = () => {
  const {
    VITE_AUTHOR_NAME,
    VITE_AUTHOR_PROFESSION,
    VITE_BLOG_DESCRIPTION,
    VITE_AUTHOR_EMAIL,
    VITE_AUTHOR_GITHUB,
    VITE_AUTHOR_LINKEDIN,
    VITE_AUTHOR_TWITTER,
    VITE_AUTHOR_FIVERR,
    VITE_AUTHOR_UPWORK
  } = import.meta.env;

  const author = {
    name: VITE_AUTHOR_NAME || "Your Name",
    description: VITE_BLOG_DESCRIPTION || "Description",
    profession: VITE_AUTHOR_PROFESSION || "Developer",
    email: VITE_AUTHOR_EMAIL || "your.email@example.com",
    github: VITE_AUTHOR_GITHUB || "",
    linkedin: VITE_AUTHOR_LINKEDIN || "",
    twitter: VITE_AUTHOR_TWITTER || "",
    fiverr: VITE_AUTHOR_FIVERR || "",
    upwork: VITE_AUTHOR_UPWORK || ""
  };

  const getSocialIcon = url => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("github")) return <FiGithub className="w-5 h-5" />;
    if (lowerUrl.includes("linkedin"))
      return <FiLinkedin className="w-5 h-5" />;
    if (lowerUrl.includes("x") || lowerUrl.includes("twitter"))
      return <FaXTwitter className="w-5 h-5" />;
    if (lowerUrl.includes("fiverr"))
      return <TbBrandFiverr className="w-5 h-5" />;
    if (lowerUrl.includes("upwork"))
      return <TbBrandUpwork className="w-5 h-5" />;
    return <FiExternalLink className="w-5 h-5" />;
  };

  const ContactLink = ({ url, children, isEmail = false }) => {
    if (!url) return null;

    return (
      <Link
        to={isEmail ? `mailto:${url}` : url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-3 font-mono text-blue-400 hover:text-blue-300 transition-all duration-200 pl-6 py-2 before:content-['→'] before:absolute before:left-0 before:text-blue-500 before:opacity-0 before:transition-all before:duration-200 hover:before:opacity-100 hover:pl-8"
      >
        <span className="text-blue-500 group-hover:text-blue-300 transition-colors flex-shrink-0">
          {isEmail ? <FiMail className="w-5 h-5" /> : getSocialIcon(url)}
        </span>
        <span className="truncate">
          {children || (isEmail ? url : StripSchema(url))}
        </span>
      </Link>
    );
  };

  return (
    <div className="flex justify-center w-full">
      <SEO />
      <div className="space-y-16 w-full max-w-3xl px-4">
        {/* Hero Section with accent border */}
        <section className="border-l-4 border-blue-500 pl-6 py-4">
          <p className="text-sm font-mono text-blue-400 mb-3 tracking-wider uppercase">
            {author.profession}
          </p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-blue-300 mb-6 leading-tight">
            {author.name}
          </h1>
          <p className="text-lg text-[var(--color-text-primary)] leading-relaxed">
            {author.description}
          </p>
        </section>

        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-3xl font-heading font-semibold text-blue-300 mb-6">
            Greeting
          </h2>
          <p className="text-[var(--color-text-primary)] leading-relaxed">
            If you want to talk about technology, collaborate on a project, or
            just say hello, I'd love to hear from you! Feel free to reach out
            through any of these channels:
          </p>
        </section>

        {/* Contact and Social Links  */}
        <section className="space-y-4">
          <ContactLink url={author.email} isEmail={true} />
          <ContactLink url={author.github} />
          <ContactLink url={author.linkedin} />
          <ContactLink url={author.twitter} />
          <ContactLink url={author.fiverr} />
          <ContactLink url={author.upwork} />
        </section>
      </div>
    </div>
  );
};

export default About;

import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import SEO from "@/components/SEO";

const About = () => {
  const {
    VITE_AUTHOR_NAME,
    VITE_AUTHOR_PROFESSION,
    VITE_BLOG_DESCRIPTION,
    VITE_AUTHOR_EMAIL,
    VITE_AUTHOR_GITHUB,
    VITE_AUTHOR_LINKEDIN,
    VITE_AUTHOR_TWITTER
  } = import.meta.env;

  const author = {
    name: VITE_AUTHOR_NAME || "Your Name",
    description: VITE_BLOG_DESCRIPTION || "Description",
    profession: VITE_AUTHOR_PROFESSION || "Developer",
    email: VITE_AUTHOR_EMAIL || "your.email@example.com",
    github: VITE_AUTHOR_GITHUB || "",
    linkedin: VITE_AUTHOR_LINKEDIN || "",
    twitter: VITE_AUTHOR_TWITTER || ""
  };

  const socialLinks = [
    { url: author.github, icon: <FiGithub /> },
    { url: author.linkedin, icon: <FiLinkedin /> },
    { url: author.twitter, icon: <FaXTwitter /> },
    { url: author.email, icon: <FiMail />, type: "email" }
  ];

  const getLink = social => {
    if (social.type === "email") {
      return `mailto:${social.url}`;
    }
    return social.url;
  };

  return (
    <div className="flex justify-center w-full">
      <SEO title={`About ${author.name}`} description={author.description} />
      <div className="w-full max-w-4xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Profile Picture and Social Links */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-48 h-48 bg-neutral-800 rounded-full mb-6 border-4 border-neutral-700"></div>
            <h2 className="text-2xl font-heading font-bold text-blue-300">
              {author.name}
            </h2>
            <p className="text-md text-neutral-400 mb-4">{author.profession}</p>
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
          </div>

          {/* Right Column: Main Content */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-heading font-bold text-blue-300 mb-6">
              About Me
            </h1>
            <div className="prose prose-invert text-neutral-300 leading-relaxed">
              <p>{author.description}</p>
              <p>
                If you want to talk about technology, collaborate on a project,
                or just say hello, I'd love to hear from you! Feel free to reach
                out to me.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

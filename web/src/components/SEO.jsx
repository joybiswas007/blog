import { useEffect } from "react";
export default function SEO({
  title,
  description = "I am Joy Biswas, a backend developer who enjoys building and learning new things. Most of the time, I build things for my personal use and share them on GitHub. I love the challenges that come with the development process. When I am not coding, I enjoy reading technical blog posts, watching movies, or listening to music.",
  keywords = "backend developer, go developer, golang developer, docker specialist, postgresql expert, rest api development, graphql api, microservices architecture, cli tools development, freelance developer, web security expert, javascript programming, node.js development, server-side development, database design, api integration, devops engineer, cloud deployment, containerization, software engineer, full stack developer, remote developer, tech consultant, web application development, system architecture, scalable applications, secure coding practices, automation tools, linux systems, git version control, agile development, n8n, ai",
  ogType = "website"
}) {
  const {
    VITE_BLOG_NAME: blogName,
    VITE_BLOG_DESCRIPTION,
    VITE_BLOG_KEYWORDS,
    VITE_AUTHOR_NAME: author,
    VITE_GTAGID: gTagID
  } = import.meta.env;
  title = title ? `${title} - ${blogName}` : blogName;
  description =
    description || VITE_BLOG_DESCRIPTION || "Blog for tech enthusiasts";

  keywords = keywords || VITE_BLOG_KEYWORDS || "blog, personal, golang";

  // Get current URL safely for SSR compatibility
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />
      <link
        href="/rss.xml"
        rel="alternate"
        type="application/xml"
        title={`${blogName} RSS Feed`}
      />
      {gTagID && <GoogleAnalytics gTagID={gTagID} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={blogName} />
      {/* {ogImage && <meta property="og:image" content={ogImage} />} */}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={blogName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="twitter_card_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#0d1117" />
      <meta name="msapplication-navbutton-color" content="#0d1117" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="msapplication-TileColor" content="#0d1117" />

      {/* Geo Tags */}
      <meta name="geo.region" content="Global" />
      <meta name="geo.placename" content="Remote" />

      {/* Professional Tags */}
      <meta name="category" content="Technology" />
      <meta name="coverage" content="Worldwide" />
      <meta name="rating" content="General" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
    </>
  );
}

const GoogleAnalytics = ({ gTagID }) => {
  useEffect(() => {
    if (!gTagID) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", gTagID);
  }, [gTagID]);

  if (!gTagID) return null;

  return (
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${gTagID}`}
    />
  );
};

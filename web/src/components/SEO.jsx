export default function SEO({
  title,
  description = "I am Joy Biswas, a backend developer who enjoys building and learning new things. Most of the time, I build things for my personal use and share them on GitHub. I love the challenges that come with the development process. When I am not coding, I enjoy reading technical blog posts, watching movies, or listening to music.",
  keywords = "backend developer, go developer, golang developer, docker specialist, postgresql expert, rest api development, graphql api, microservices architecture, cli tools development, freelance developer, web security expert, javascript programming, node.js development, server-side development, database design, api integration, devops engineer, cloud deployment, containerization, software engineer, full stack developer, remote developer, tech consultant, web application development, system architecture, scalable applications, secure coding practices, automation tools, linux systems, git version control, agile development, n8n, ai",
  ogType = "website"
}) {
  const blogName = "Joy's Blog";

  title = title ? `${title} - ${blogName}` : blogName;

  // Get current URL safely for SSR compatibility
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const og_image = `${window.location.protocol}//${window.location.host}/og-image.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={og_image} />

      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={og_image} />
    </>
  );
}

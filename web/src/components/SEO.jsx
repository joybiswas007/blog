import { useEffect } from "react";
export default function SEO({
  title,
  description,
  keywords,
  ogType = "website"
}) {
  const {
    VITE_BLOG_NAME: blogName,
    VITE_BLOG_DESCRIPTION,
    VITE_BLOG_KEYWORDS,
    VITE_AUTHOR_NAME: author,
    VITE_GTAGID: gTagID,
    VITE_OG_IMAGE: ogImage
  } = import.meta.env;
  title = title ? `${title} - ${blogName}` : blogName;

  description =
    description || VITE_BLOG_DESCRIPTION || "Blog for tech enthusiasts";

  keywords =
    keywords || VITE_BLOG_KEYWORDS || "blog, personal, golang, javascript";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
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
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content={blogName} />
      {ogImage && <meta property="og:image" content={ogImage} />}
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

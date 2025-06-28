import Header from "./Header";
import Footer from "./Footer";
import BackToTopButton from "./BackToTop";

export default function Layout({ children }) {
  const {
    VITE_AUTHOR_NAME: author,
    VITE_BLOG_NAME: blogName,
    VITE_BLOG_SOURCE: sourceCode
  } = import.meta.env;
  return (
    <div className="flex flex-col min-h-screen">
      <Header blogName={blogName} />
      <main className="flex-1 mx-auto w-full max-w-3xl py-8 px-4 prose">
        {children}
      </main>
      <Footer authorName={author} sourceCode={sourceCode} />
      <BackToTopButton />
    </div>
  );
}

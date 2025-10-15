import Header from "./Header";
import StatusBar from "./StatusBar";
import Sidebar from "./Sidebar";
import BackToTopButton from "./BackToTop";

export default function Layout({ children }) {
  const {
    VITE_AUTHOR_NAME: author,
    VITE_BLOG_NAME: blogName,
    VITE_BLOG_SOURCE: sourceCode
  } = import.meta.env;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-editor-bg)]">
      <Header blogName={blogName} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main
          id="editor-pane"
          className="flex-1 overflow-y-auto bg-[var(--color-editor-bg)]"
        >
          <div className="max-w-4xl mx-auto py-8 px-6">{children}</div>
        </main>
      </div>

      <StatusBar authorName={author} sourceCode={sourceCode} />
      <BackToTopButton />
    </div>
  );
}

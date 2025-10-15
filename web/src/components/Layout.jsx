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
    <div className="ide-container">
      <Header blogName={blogName} />

      <div className="ide-body">
        <Sidebar />

        <main className="editor-pane">
          <div className="editor-content">{children}</div>
        </main>
      </div>

      <StatusBar authorName={author} sourceCode={sourceCode} />
      <BackToTopButton />
    </div>
  );
}

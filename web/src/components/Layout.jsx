import Header from "@/components/Header";
import StatusBar from "@/components/StatusBar";
import Sidebar from "@/components/Sidebar";
import BackToTop from "@/components/BackToTop";

const Layout = ({ children }) => {
  const author = "Joy Biswas";

  const sourceCode = "https://github.com/joybiswas007/blog";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-editor-bg)]">
      <Header blogName="Joy's Blog" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main
          id="editor-pane"
          className="flex-1 overflow-y-auto bg-[var(--color-editor-bg)]"
        >
          <div className="max-w-4xl mx-auto py-8 px-6 md:px-6 px-4">
            {children}
          </div>
        </main>
      </div>

      <StatusBar authorName={author} sourceCode={sourceCode} />
      <BackToTop />
    </div>
  );
};

export default Layout;

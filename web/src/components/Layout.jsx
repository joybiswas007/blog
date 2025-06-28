import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header blogName="Joy's Blog" />
      <main className="flex-1 mx-auto w-full max-w-3xl py-8 px-4 prose">
        {children}
      </main>
      <Footer
        authorName="Joy Biswas"
        sourceCode="https://github.com/joybiswas007/blog"
      />
    </div>
  );
}

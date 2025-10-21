import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const editorPane = document.getElementById("editor-pane");

    if (!editorPane) return;

    const handleScroll = () => {
      setVisible(editorPane.scrollTop > 200);
    };

    editorPane.addEventListener("scroll", handleScroll, { passive: true });
    return () => editorPane.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    const editorPane = document.getElementById("editor-pane");
    if (editorPane) {
      editorPane.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed z-50 bottom-20 md:bottom-8 right-4 md:right-6 bg-[#61afef] hover:bg-[#84c0f4] text-[#21252b] p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 border-2 border-[#61afef] hover:scale-110 active:scale-95"
      aria-label="Back to top"
      type="button"
    >
      <FiArrowUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;

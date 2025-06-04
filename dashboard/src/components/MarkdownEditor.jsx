import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownEditor = ({ value, onChange }) => {
  return (
    <MDEditor
      value={value}
      onChange={onChange}
      height={400}
      visibleDragbar={false}
    />
  );
};

export default MarkdownEditor;

import { useEffect } from "react";

const Title = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return;
};

export default Title;

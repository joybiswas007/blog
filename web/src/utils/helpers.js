export const calculateWordCount = content => {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const CalculateReadTime = content => {
  const wordsPerMinute = 200;
  const wordCount = calculateWordCount(content);
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

export const StripSchema = url => {
  return url.replace(/^https?:\/\//, "");
};

export const formatDate = dateString => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
};

export const TruncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space within the desired length
  const lastSpace = text.lastIndexOf(" ", maxLength);

  // If no space is found, just slice normally (for very long single words)
  if (lastSpace === -1) {
    return text.slice(0, maxLength) + "...";
  }

  return text.slice(0, lastSpace) + "...";
};

export const CalculateReadTime = content => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

export const StripSchema = url => {
  return url.replace(/^https?:\/\//, "");
};

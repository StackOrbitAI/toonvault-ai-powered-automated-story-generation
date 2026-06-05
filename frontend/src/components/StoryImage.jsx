import React, { useState } from "react";
const DEFAULT_COVER = "/covers/fantasy_cover_1777743338844.png";

export default function StoryImage({ src, alt, style, className, fallback = DEFAULT_COVER }) {
  const [error, setError] = useState(false);

  const finalSrc = error ? fallback : (src && src.includes("/src/assets/") ? src.replace("/src/assets/", "/covers/") : src);
  const isUrl = typeof finalSrc === 'string' && (finalSrc.startsWith("http") || finalSrc.startsWith("/"));

  if (!isUrl) {
    return (
      <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }} className={className}>
        {finalSrc || "📖"}
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      style={{ ...style, objectFit: "cover" }}
      className={className}
      onError={() => setError(true)}
    />
  );
}

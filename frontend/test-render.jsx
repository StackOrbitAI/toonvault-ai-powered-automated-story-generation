import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import StoryPage from './src/components/StoryPage';

try {
  console.log("Rendering...");
  const html = renderToString(
    <HelmetProvider>
      <StaticRouter location="/story/6a0ae2cfe3f96d12a4b9772c">
        <StoryPage />
      </StaticRouter>
    </HelmetProvider>
  );
  console.log("Success! HTML length:", html.length);
} catch (e) {
  console.error("RENDER ERROR:", e);
}

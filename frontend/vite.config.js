import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Docker dev me BACKEND_HOST=backend set hoga, local me localhost
const backendHost = process.env.BACKEND_HOST || "localhost"
const backendUrl = `http://${backendHost}:5000`

// Docker dev me HMR_PORT set hoga (3000), production me 443
const hmrClientPort = parseInt(process.env.HMR_CLIENT_PORT || "443")

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: ["toonvault.com"],
    // Allowed hosts should be at the server root in newer Vite, 
    // but in older versions it might need to be handled via proxy or ignored.
    // Explicitly ignoring root non-JS files helps with the reported error.
    watch: {
      ignored: ['**/Dockerfile', '**/Dockerfile.dev', '**/.env', '**/dist/**']
    },
    hmr: {
      clientPort: hmrClientPort,
      overlay: true,
    },
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendUrl,
        ws: true,
      }
    }
  }
})

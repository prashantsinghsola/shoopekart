import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This makes Vite serve index.html for ALL routes (e.g. /admin, /profile)
    // so the React app can handle client-side routing correctly.
    historyApiFallback: true,
  },
})

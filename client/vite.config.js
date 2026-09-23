import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Date of the build, as DD.MM.YYYY. Built by hand rather than with
// toLocaleDateString, whose output follows the build machine's locale — a CI
// runner on a different default would silently ship a differently-formatted
// version string.
const d = new Date()
const pad = (n) => String(n).padStart(2, '0')
const buildStamp = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Substituting into import.meta.env keeps this out of the global scope, so
    // no lint globals entry is needed and it resolves in dev as well as build.
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.VITE_APP_VERSION ?? buildStamp
    ),
  },
  plugins: [react(), tailwindcss()],
})

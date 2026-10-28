import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// #root holds a prerendered copy of the page for crawlers (scripts/prerender.mjs).
// The layout depends on the viewport, so render fresh instead of hydrating.
const container = document.getElementById('root')!
container.replaceChildren()
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

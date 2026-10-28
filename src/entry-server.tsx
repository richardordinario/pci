import { renderToString } from 'react-dom/server'
import App from './App.tsx'

// Used at build time only, to prerender the page into dist/index.html.
export function render() {
  return renderToString(<App />)
}

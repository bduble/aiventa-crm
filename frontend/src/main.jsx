import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error("Could not find #root element")
}
const root = createRoot(container)
root.render(
  <ThemeProvider>
    <div className="page-frame">
      <App />
    </div>
  </ThemeProvider>
)

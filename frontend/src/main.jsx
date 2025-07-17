import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error("Could not find #root element")
}
const root = createRoot(container)
root.render(
  <div className="page-frame">
    <App />
  </div>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/style.css'
import './styles/animations.css'
import './styles/portfolio-gallery.css'
import './styles/persistent-header.css'
import './styles/pages.css'
import './styles/portfolio-page.css'
import './styles/portfolio-detail.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

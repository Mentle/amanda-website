import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Background from './components/Background'
import PillNav from './components/PillNav'
import PasswordGate from './components/PasswordGate'
import Home from './pages/Home'
import About from './pages/About'
import PortfolioDetail from './pages/PortfolioDetail'
import Contact from './pages/Contact'

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    // Clean up scroll effects when navigating
    document.body.classList.remove('scrolled')
    document.documentElement.classList.remove('scrolled')
    
    // Remove white overlay if it exists
    const whiteOverlay = document.getElementById('white-transition-overlay')
    if (whiteOverlay) {
      whiteOverlay.remove()
    }
    
    if (isHomePage) {
      // Scroll to top when returning to home
      window.scrollTo(0, 0)
      
      // Only show loading screen on first visit
      if (!hasLoadedOnce) {
        setIsLoading(true)
        setShowLoadingScreen(true)
        document.body.classList.add('loading')
      } else {
        // Already loaded, no loading screen needed
        setIsLoading(false)
        setShowLoadingScreen(false)
        document.body.classList.remove('loading')
      }
    } else {
      // On other pages, immediately hide loading
      setIsLoading(false)
      setShowLoadingScreen(false)
      document.body.classList.remove('loading')
    }
  }, [isHomePage, hasLoadedOnce])

  const handleLoadComplete = () => {
    setIsLoading(false)
    document.body.classList.remove('loading')
    setShowLoadingScreen(false)
    setHasLoadedOnce(true)
  }

  return (
    <PasswordGate>
      <div className={isLoading ? 'loading' : ''}>
        <LoadingScreen style={{ display: showLoadingScreen ? 'flex' : 'none' }} />
        <div className="vignette-container" style={{ display: isHomePage ? 'block' : 'none' }}></div>
        <div style={{ display: isHomePage ? 'block' : 'none' }}>
          <Background onLoadComplete={handleLoadComplete} isActive={isHomePage} />
        </div>
        <PillNav
          logo={<span style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>AM</span>}
          logoAlt="Amanda Michelena"
          items={menuItems}
          activeHref={location.pathname}
          baseColor="#000000"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
          initialLoadAnimation={false}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </PasswordGate>
  )
}

export default App
